import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { head } from "@vercel/blob";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { validateNominationBlockB } from "@/features/applications/schemas/category-field-validation";
import type {
  ApplicationFileRef,
  ApplicationValues,
  ApplyFieldConfig,
} from "@/features/applications/types/application.types";
import { requireEditableNomination } from "@/features/account/server/nomination-guards";
import { prisma } from "@/shared/lib/prisma";
import { syncApplicationOnChange } from "@/features/google-sheets";
import { activateRequestDataScope } from "@/features/test/server/data-scope";

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

function toAnswerRecord(fieldKey: string, value: ApplicationValues[string]) {
  if (Array.isArray(value)) {
    const stringValues = value.filter((item): item is string => typeof item === "string");
    return stringValues.length > 0
      ? { fieldKey, valueJson: stringValues as Prisma.InputJsonValue }
      : null;
  }
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) && /^-?\d+$/.test(trimmed)
    ? { fieldKey, valueText: trimmed, valueNumber: numericValue }
    : { fieldKey, valueText: trimmed };
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
      if (ref.fieldKey !== field.key || !isPathForField(ref.fileUrl, nominationId, field.key) || !field.accept?.includes(ref.mimeType) || ref.fileSize > (field.maxFileSizeMb ?? 5) * 1024 * 1024) {
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
    const validation = validateNominationBlockB(nomination.category.slug, values);
    if (action === "submit" && Object.keys(validation).length > 0) {
      console.warn("Applicant nomination submission validation failed", { nominationId, requestId, action, code: "VALIDATION" });
      return NextResponse.json({ errorCode: "VALIDATION", requestId, message: "Please complete the required nomination fields before submitting.", fieldErrors: validation }, { status: 400, headers: { "X-Request-Id": requestId } });
    }
    if (nomination.status === "SUBMITTED" && Object.keys(validation).length > 0) {
      return NextResponse.json({ errorCode: "VALIDATION", requestId, message: "Submitted nominations must remain complete. Revert to valid values before saving.", fieldErrors: validation }, { status: 400, headers: { "X-Request-Id": requestId } });
    }

    const fileFieldKeys = new Set(categoryFields.filter((field) => field.type === "file").map((field) => field.key).filter((key) => Object.hasOwn(values, key)));
    const answerKeys = Object.keys(values).filter((key) => !fileFieldKeys.has(key));
    const answerRecords = answerKeys.map((key) => toAnswerRecord(key, values[key])).filter((item): item is NonNullable<typeof item> => item !== null);
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.nominationAnswer.deleteMany({ where: { nominationApplicationId: nomination.id, fieldKey: { in: answerKeys.filter((key) => !answerRecords.some((answer) => answer.fieldKey === key)) } } });
      for (const answer of answerRecords) {
        const { fieldKey, ...data } = answer;
        await tx.nominationAnswer.upsert({
          where: { nominationApplicationId_fieldKey: { nominationApplicationId: nomination.id, fieldKey } },
          create: { nominationApplicationId: nomination.id, fieldKey, ...data },
          update: { valueText: data.valueText ?? null, valueNumber: data.valueNumber ?? null, valueBoolean: null, valueJson: data.valueJson ?? Prisma.JsonNull },
        });
      }

      for (const fieldKey of fileFieldKeys) {
        const refs = getFileRefs(values[fieldKey]);
        await tx.nominationFile.updateMany({ where: { nominationApplicationId: nomination.id, fieldKey, deletedAt: null, ...(refs.length > 0 ? { fileUrl: { notIn: refs.map((ref) => ref.fileUrl) } } : {}) }, data: { deletedAt: now } });
        for (const ref of refs) {
          const displayFileName = sanitizeDisplayFilename(ref.fileName);
          const data = { fieldKey, fileName: displayFileName, fileUrl: ref.fileUrl, originalFileName: ref.fileName, displayFileName, mimeType: ref.mimeType || "application/octet-stream", fileSize: ref.fileSize, originalFileSize: ref.fileSize, compressedFileSize: ref.fileSize, storageKey: ref.fileUrl, deletedAt: null };
          await tx.nominationFile.upsert({
            where: { nominationApplicationId_fileUrl: { nominationApplicationId: nomination.id, fileUrl: ref.fileUrl } },
            create: { nominationApplicationId: nomination.id, ...data },
            update: data,
          });
        }
      }

      if (action === "submit") {
        await tx.nominationApplication.update({ where: { id: nomination.id }, data: { status: "SUBMITTED", submittedAt: nomination.submittedAt ?? now } });
      } else if (nomination.status !== "SUBMITTED") {
        await tx.nominationApplication.update({ where: { id: nomination.id }, data: { status: "DRAFT" } });
      }
    });

    if (nomination.applicantProfileId) syncApplicationOnChange(nomination.applicantProfileId);
    return NextResponse.json({ ok: true, requestId, status: action === "submit" ? "SUBMITTED" : nomination.status === "SUBMITTED" ? "SUBMITTED" : "DRAFT" }, { headers: { "X-Request-Id": requestId } });
  } catch (error) {
    return failureResponse({ nominationId, requestId, action, error });
  }
}
