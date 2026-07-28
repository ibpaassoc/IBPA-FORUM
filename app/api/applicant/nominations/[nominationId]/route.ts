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

type RequestBody = {
  action?: "draft" | "submit";
  values?: Record<string, unknown>;
};

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
    if (stringValues.length > 0) {
      return { fieldKey, valueJson: stringValues as Prisma.InputJsonValue };
    }
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const numericValue = Number(trimmed);
  if (Number.isFinite(numericValue) && /^-?\d+$/.test(trimmed)) {
    return { fieldKey, valueText: trimmed, valueNumber: numericValue };
  }

  return { fieldKey, valueText: trimmed };
}

function getFileRefs(value: ApplicationValues[string]) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Map(
      value
        .filter(isApplicationFileRef)
        .map((ref) => [ref.fileUrl, ref] as const),
    ).values(),
  );
}

function sanitizeDisplayFilename(name: string) {
  const basename = name.split(/[\\/]/).pop() ?? "file";
  return basename
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "file";
}

function isPathForField(
  pathname: string,
  nominationId: string,
  fieldKey: string,
) {
  const prefix = `applications/${nominationId}/${fieldKey}/`;
  const filename = pathname.slice(prefix.length);
  return (
    pathname.startsWith(prefix) &&
    filename.length > 0 &&
    !filename.includes("/") &&
    filename !== "." &&
    filename !== ".."
  );
}

async function validateUploadedFiles({
  nominationId,
  fields,
  values,
  existingFiles,
}: {
  nominationId: string;
  fields: ApplyFieldConfig[];
  values: ApplicationValues;
  existingFiles: Array<{
    fieldKey: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
  }>;
}) {
  const existingByPath = new Map(
    existingFiles.map((file) => [file.fileUrl, file]),
  );
  const normalized = { ...values };
  const errors: Record<string, string> = {};

  await Promise.all(
    fields
      .filter(
        (field) =>
          field.type === "file" && Object.hasOwn(values, field.key),
      )
      .map(async (field) => {
        const refs = getFileRefs(values[field.key]);
        if (field.maxFiles !== undefined && refs.length > field.maxFiles) {
          errors[field.key] = `${field.label} accepts up to ${field.maxFiles} files.`;
          return;
        }

        const checked = await Promise.all(
          refs.map(async (ref): Promise<ApplicationFileRef | null> => {
            const existing = existingByPath.get(ref.fileUrl);
            if (existing?.fieldKey === field.key) {
              return {
                fieldKey: existing.fieldKey,
                fileName: existing.fileName,
                fileUrl: existing.fileUrl,
                mimeType: existing.mimeType,
                fileSize: existing.fileSize,
              };
            }

            if (
              ref.fieldKey !== field.key ||
              !isPathForField(ref.fileUrl, nominationId, field.key) ||
              !field.accept?.includes(ref.mimeType) ||
              ref.fileSize > (field.maxFileSizeMb ?? 5) * 1024 * 1024
            ) {
              errors[field.key] = `${ref.fileName} is not a valid upload for ${field.label}.`;
              return null;
            }

            try {
              const blob = await head(ref.fileUrl);
              if (
                blob.pathname !== ref.fileUrl ||
                blob.size !== ref.fileSize ||
                blob.contentType !== ref.mimeType
              ) {
                errors[field.key] = `${ref.fileName} upload metadata could not be verified.`;
                return null;
              }
            } catch {
              errors[field.key] = `${ref.fileName} could not be found in secure file storage. Please retry the upload.`;
              return null;
            }

            return ref;
          }),
        );

        normalized[field.key] = checked.filter(
          (ref): ref is ApplicationFileRef => ref !== null,
        );
      }),
  );

  return { values: normalized, errors };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ nominationId: string }> }
) {
  const { nominationId } = await params;
  const { nomination } = await requireEditableNomination(nominationId);

  if (nomination.paymentStatus !== "PAID") {
    return NextResponse.json(
      { message: "Only paid nominations can be edited." },
      { status: 409 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as RequestBody;
  const action = body.action === "submit" ? "submit" : "draft";
  const rawValues = Object.fromEntries(
    Object.entries(body.values ?? {}).map(([key, value]) => [key, normalizeValue(value)])
  ) as ApplicationValues;

  const categorySlug = nomination.category.slug;
  const categoryFields = categoryFieldConfigs[categorySlug] ?? [];
  const verifiedFiles = await validateUploadedFiles({
    nominationId: nomination.id,
    fields: categoryFields,
    values: rawValues,
    existingFiles: nomination.files,
  });
  if (Object.keys(verifiedFiles.errors).length > 0) {
    return NextResponse.json(
      {
        message: "One or more uploaded files could not be verified.",
        fieldErrors: verifiedFiles.errors,
      },
      { status: 400 },
    );
  }
  const values = verifiedFiles.values;
  const validation = validateNominationBlockB(categorySlug, values);

  if (action === "submit" && Object.keys(validation).length > 0) {
    return NextResponse.json(
      {
        message: "Please complete the required nomination fields before submitting.",
        fieldErrors: validation,
      },
      { status: 400 }
    );
  }

  if (nomination.status === "SUBMITTED" && Object.keys(validation).length > 0) {
    return NextResponse.json(
      {
        message: "Submitted nominations must remain complete. Revert to valid values before saving.",
        fieldErrors: validation,
      },
      { status: 400 }
    );
  }

  // Use the category configuration rather than only non-empty refs so an
  // applicant can remove every uploaded video (or other file) and have its
  // previous records correctly soft-deleted.
  const fileFieldKeys = new Set(
    categoryFields
      .filter((field) => field.type === "file")
      .map((field) => field.key)
      .filter((key) => Object.hasOwn(values, key)),
  );
  const answerRecords = Object.entries(values)
    .filter(([key]) => !fileFieldKeys.has(key))
    .map(([key, value]) => toAnswerRecord(key, value))
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.nominationAnswer.deleteMany({
      where: {
        nominationApplicationId: nomination.id,
        fieldKey: { in: Object.keys(values).filter((key) => !fileFieldKeys.has(key)) },
      },
    });

    if (answerRecords.length > 0) {
      await tx.nominationAnswer.createMany({
        data: answerRecords.map((answer) => ({
          nominationApplicationId: nomination.id,
          ...answer,
        })),
      });
    }

    for (const fieldKey of fileFieldKeys) {
      const refs = getFileRefs(values[fieldKey]);
      await tx.nominationFile.updateMany({
        where: {
          nominationApplicationId: nomination.id,
          fieldKey,
          deletedAt: null,
          ...(refs.length > 0
            ? { fileUrl: { notIn: refs.map((ref) => ref.fileUrl) } }
            : {}),
        },
        data: { deletedAt: now },
      });

      for (const ref of refs) {
        const fileData = {
          fieldKey,
          fileName: sanitizeDisplayFilename(ref.fileName),
          fileUrl: ref.fileUrl,
          originalFileName: ref.fileName,
          displayFileName: sanitizeDisplayFilename(ref.fileName),
          mimeType: ref.mimeType || "application/octet-stream",
          fileSize: ref.fileSize,
          originalFileSize: ref.fileSize,
          compressedFileSize: ref.fileSize,
          storageKey: ref.fileUrl,
          deletedAt: null,
        };
        const existingFile = await tx.nominationFile.findFirst({
          where: {
            nominationApplicationId: nomination.id,
            fileUrl: ref.fileUrl,
          },
          select: { id: true },
        });
        if (existingFile) {
          await tx.nominationFile.update({
            where: { id: existingFile.id },
            data: fileData,
          });
        } else {
          await tx.nominationFile.create({
            data: {
              nominationApplicationId: nomination.id,
              ...fileData,
            },
          });
        }
      }
    }

    if (action === "submit") {
      await tx.nominationApplication.update({
        where: { id: nomination.id },
        data: {
          status: "SUBMITTED",
          submittedAt: nomination.submittedAt ?? now,
        },
      });
    } else if (nomination.status !== "SUBMITTED") {
      await tx.nominationApplication.update({
        where: { id: nomination.id },
        data: { status: "DRAFT" },
      });
    }
  });

  if (nomination.applicantProfileId) {
    syncApplicationOnChange(nomination.applicantProfileId);
  }

  return NextResponse.json({
    ok: true,
    status: action === "submit" ? "SUBMITTED" : nomination.status === "SUBMITTED" ? "SUBMITTED" : "DRAFT",
  });
}
