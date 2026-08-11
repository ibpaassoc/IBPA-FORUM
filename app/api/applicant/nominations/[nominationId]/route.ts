import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { head } from "@vercel/blob";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  getNewValidationErrors,
  validateNominationBlockB,
} from "@/features/applications/schemas/category-field-validation";
import type {
  ApplicationFileRef,
  ApplicationValues,
  ApplyFieldConfig,
} from "@/features/applications/types/application.types";
import { nominationValuesFromStorage } from "@/features/applications/lib/nomination-values";
import { requireEditableNomination } from "@/features/account/server/nomination-guards";
import { prisma } from "@/shared/lib/prisma";
import { syncApplicationOnChange } from "@/features/google-sheets";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import {
  parseNominationAnswers,
  parseStoredFiles,
  type NominationAnswers,
  type StoredFiles,
} from "@/features/database/json-fields";
import { assertNominationStatusTransition } from "@/features/database/nomination-status";

type RequestBody = {
  action?: "draft" | "submit";
  values?: Record<string, unknown>;
};

type NominationErrorCode =
  | "AUTHENTICATION"
  | "VALIDATION"
  | "UPLOAD"
  | "TIMEOUT"
  | "UNEXPECTED";

function normalizeValue(value: unknown): ApplicationValues[string] {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const refs = value.filter(isApplicationFileRef);
    if (refs.length > 0) return refs;
    return value.filter((item): item is string => typeof item === "string");
  }
  return "";
}

function getFileRefs(value: ApplicationValues[string]) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Map(value.filter(isApplicationFileRef).map((ref) => [ref.fileUrl, ref] as const)).values(),
  );
}

function sanitizeDisplayFilename(name: string) {
  const basename = name.split(/[\\/]/).pop() ?? "file";
  return basename.replace(/[^\w.\- ]+/g, "").replace(/\s+/g, " ").trim().slice(0, 120) || "file";
}

function isPathForField(pathname: string, nominationId: string, fieldKey: string) {
  const prefix = `applications/${nominationId}/${fieldKey}/`;
  const filename = pathname.slice(prefix.length);
  return pathname.startsWith(prefix) && filename.length > 0 && !filename.includes("/") && filename !== "." && filename !== "..";
}

async function validateUploadedFiles({ nominationId, fields, values, existingFiles }: {
  nominationId: string;
  fields: ApplyFieldConfig[];
  values: ApplicationValues;
  existingFiles: Array<{ fieldKey: string; fileName: string; fileUrl: string; mimeType: string; fileSize: number }>;
}) {
  const existingByPath = new Map(existingFiles.map((file) => [file.fileUrl, file]));
  const normalized = { ...values };
  const errors: Record<string, string> = {};

  await Promise.all(fields.filter((field) => field.type === "file" && Object.hasOwn(values, field.key)).map(async (field) => {
    const refs = getFileRefs(values[field.key]);
    if (field.maxFiles !== undefined && refs.length > field.maxFiles) {
      errors[field.key] = `${field.label} accepts up to ${field.maxFiles} files.`;
      return;
    }

    const checked = await Promise.all(refs.map(async (ref): Promise<ApplicationFileRef | null> => {
      const existing = existingByPath.get(ref.fileUrl);
      if (existing?.fieldKey === field.key) {
        return { fieldKey: existing.fieldKey, fileName: existing.fileName, fileUrl: existing.fileUrl, mimeType: existing.mimeType, fileSize: existing.fileSize };
      }
      if (ref.fieldKey !== field.key || !isPathForField(ref.fileUrl, nominationId, field.key) || !field.accept?.includes(ref.mimeType)) {
        errors[field.key] = `${ref.fileName} is not a valid upload for ${field.label}.`;
        return null;
      }
      try {
        const blob = await head(ref.fileUrl);
        if (blob.pathname !== ref.fileUrl || blob.size !== ref.fileSize || blob.contentType !== ref.mimeType) {
          errors[field.key] = `${ref.fileName} upload metadata could not be verified.`;
          return null;
        }
      } catch {
        errors[field.key] = `${ref.fileName} could not be found in secure file storage. Please retry the upload.`;
        return null;
      }
      return ref;
    }));
    normalized[field.key] = checked.filter((ref): ref is ApplicationFileRef => ref !== null);
  }));

  return { values: normalized, errors };
}

function errorCode(error: unknown): NominationErrorCode {
  if (error instanceof Response && error.status === 401) return "AUTHENTICATION";
  if (error instanceof DOMException && error.name === "TimeoutError") return "TIMEOUT";
  return "UNEXPECTED";
}

function failureResponse({ nominationId, requestId, action, error }: {
  nominationId: string;
  requestId: string;
  action: "draft" | "submit";
  error: unknown;
}) {
  const code = errorCode(error);
  const status = error instanceof Response ? error.status : code === "TIMEOUT" ? 504 : 500;
  console.error("Applicant nomination persistence failed", {
    nominationId,
    requestId,
    action,
    code,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  return NextResponse.json(
    { errorCode: code, requestId, message: "Unable to save this nomination right now." },
    { status, headers: { "X-Request-Id": requestId } },
  );
}

export async function POST(request: Request, { params }: { params: Promise<{ nominationId: string }> }) {
  const { nominationId } = await params;
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  let action: "draft" | "submit" = "draft";

  try {
    const { nomination } = await requireEditableNomination(nominationId);
    activateRequestDataScope({ dataScope: nomination.dataScope });
    if (nomination.paymentStatus !== "PAID") {
      return NextResponse.json({ errorCode: "VALIDATION", message: "Only paid nominations can be edited.", requestId }, { status: 409, headers: { "X-Request-Id": requestId } });
    }

    const body = (await request.json().catch(() => ({}))) as RequestBody;
    action = body.action === "submit" ? "submit" : "draft";
    const rawValues = Object.fromEntries(Object.entries(body.values ?? {}).map(([key, value]) => [key, normalizeValue(value)])) as ApplicationValues;
    const categoryFields = categoryFieldConfigs[nomination.category.slug] ?? [];
    const verifiedFiles = await validateUploadedFiles({ nominationId: nomination.id, fields: categoryFields, values: rawValues, existingFiles: nomination.files });
    if (Object.keys(verifiedFiles.errors).length > 0) {
      console.warn("Applicant nomination upload validation failed", { nominationId, requestId, action, code: "UPLOAD" });
      return NextResponse.json({ errorCode: "UPLOAD", requestId, message: "One or more uploaded files could not be verified.", fieldErrors: verifiedFiles.errors }, { status: 400, headers: { "X-Request-Id": requestId } });
    }

    const values = verifiedFiles.values;
    // File fields with uploads still in flight are intentionally omitted from
    // draft payloads so a partial upload cannot erase their persisted refs.
    // Validate the effective nomination, not that partial update by itself.
    const currentValues = nominationValuesFromStorage(
      nomination.answers,
      nomination.files,
    );
    const validationValues = { ...currentValues, ...values };
    const validation = validateNominationBlockB(
      nomination.category.slug,
      validationValues,
    );
    if (action === "submit" && Object.keys(validation).length > 0) {
      // Field keys only — the values are applicant content and stay out of logs.
      console.warn("Applicant nomination submission validation failed", { nominationId, requestId, action, code: "VALIDATION", categorySlug: nomination.category.slug, fields: Object.keys(validation) });
      return NextResponse.json({ errorCode: "VALIDATION", requestId, message: "Please complete the required nomination fields before submitting.", fieldErrors: validation }, { status: 400, headers: { "X-Request-Id": requestId } });
    }
    if (nomination.status === "SUBMITTED" && Object.keys(validation).length > 0) {
      const currentValidation = validateNominationBlockB(
        nomination.category.slug,
        currentValues,
      );
      const newValidationErrors = getNewValidationErrors(
        currentValidation,
        validation,
      );
      if (Object.keys(newValidationErrors).length > 0) {
        return NextResponse.json(
          {
            errorCode: "VALIDATION",
            requestId,
            message: "Submitted nominations cannot make a previously valid field incomplete.",
            fieldErrors: newValidationErrors,
          },
          { status: 400, headers: { "X-Request-Id": requestId } },
        );
      }
    }

    const fileFieldKeys = new Set(categoryFields.filter((field) => field.type === "file").map((field) => field.key).filter((key) => Object.hasOwn(values, key)));
    const answerKeys = Object.keys(values).filter((key) => !fileFieldKeys.has(key));
    const now = new Date();
    const currentAnswers = parseNominationAnswers(nomination.answersJson);
    const currentFiles = parseStoredFiles(nomination.filesJson);
    const answerKeySet = new Set(answerKeys);
    const nextAnswerFields = currentAnswers.fields.filter((field) => !answerKeySet.has(field.fieldId));
    for (const fieldKey of answerKeys) {
      const value = values[fieldKey];
      const normalizedValue = Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : typeof value === "string"
          ? value.trim()
          : value;
      if (normalizedValue === "" || (Array.isArray(normalizedValue) && normalizedValue.length === 0)) continue;
      const config = categoryFields.find((field) => field.key === fieldKey);
      nextAnswerFields.push({
        fieldId: fieldKey,
        label: config?.label ?? fieldKey,
        type: config?.type ?? "text",
        value: normalizedValue,
        updatedAt: now.toISOString(),
      });
    }
    const nextAnswers: NominationAnswers = { ...currentAnswers, fields: nextAnswerFields };
    const nextFileItems = currentFiles.items.filter((file) => !fileFieldKeys.has(file.fieldId));
    for (const fieldKey of fileFieldKeys) {
      const refs = getFileRefs(values[fieldKey]);
      for (const ref of refs) {
        const existing = currentFiles.items.find(
          (file) => file.fieldId === fieldKey && (file.blobKey === ref.fileUrl || file.url === ref.fileUrl)
        );
        nextFileItems.push({
          id: existing?.id ?? crypto.randomUUID(),
          fieldId: fieldKey,
          blobKey: ref.fileUrl,
          url: existing?.url ?? null,
          filename: sanitizeDisplayFilename(ref.fileName),
          mimeType: ref.mimeType || "application/octet-stream",
          size: ref.fileSize,
          originalSize: ref.fileSize,
          uploadedAt: existing?.uploadedAt ?? now.toISOString(),
        });
      }
    }
    const nextFiles: StoredFiles = { ...currentFiles, items: nextFileItems };
    const nextStatus = action === "submit" ? "SUBMITTED" : nomination.status;
    assertNominationStatusTransition(nomination.status, nextStatus);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.nomination.updateMany({
        where: { id: nomination.id, revision: nomination.revision },
        data: {
          answers: nextAnswers as unknown as Prisma.InputJsonValue,
          files: nextFiles as unknown as Prisma.InputJsonValue,
          status: nextStatus,
          submittedAt: action === "submit" ? nomination.submittedAt ?? now : nomination.submittedAt,
          revision: { increment: 1 },
        },
      });
      if (updated.count !== 1) throw new Response("Nomination changed in another session.", { status: 409 });
    });

    if (nomination.applicantProfileId) {
      // Draft autosaves only change the mirrored application row. The aggregate
      // dashboard changes when a nomination is submitted, and rebuilding it on
      // every file autosave quickly exhausts Google's per-user write quota.
      syncApplicationOnChange(nomination.applicantProfileId, {
        refreshStats: action === "submit",
      });
    }
    return NextResponse.json({ ok: true, requestId, status: nextStatus }, { headers: { "X-Request-Id": requestId } });
  } catch (error) {
    return failureResponse({ nominationId, requestId, action, error });
  }
}
