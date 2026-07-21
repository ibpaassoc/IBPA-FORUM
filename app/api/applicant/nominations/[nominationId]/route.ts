import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import { validateNominationBlockB } from "@/features/applications/schemas/category-field-validation";
import type { ApplicationValues } from "@/features/applications/types/application.types";
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
  return Array.isArray(value) ? value.filter(isApplicationFileRef) : [];
}

function sanitizeDisplayFilename(name: string) {
  const basename = name.split(/[\\/]/).pop() ?? "file";
  return basename
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "file";
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
  const values = Object.fromEntries(
    Object.entries(body.values ?? {}).map(([key, value]) => [key, normalizeValue(value)])
  ) as ApplicationValues;

  const categorySlug = nomination.category.slug;
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

  const fileFieldKeys = new Set(
    Object.entries(values)
      .filter(([, value]) => getFileRefs(value).length > 0)
      .map(([key]) => key)
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
        },
        data: { deletedAt: now },
      });

      if (refs.length > 0) {
        await tx.nominationFile.createMany({
          data: refs.map((ref) => ({
            nominationApplicationId: nomination.id,
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
          })),
        });
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
