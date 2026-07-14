import "server-only";

import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import { validateNominationBlockB } from "@/features/applications/schemas/category-field-validation";
import type { ApplicationFileRef, ApplicationValues } from "@/features/applications/types/application.types";
import { APPLICANT_APPLICATIONS_CLOSED_AT_KEY } from "@/features/applications/server/deadlines";
import { prisma } from "@/shared/lib/prisma";

function answerValue(answer: {
  fieldKey: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
}) {
  if (Array.isArray(answer.valueJson)) return answer.valueJson.filter((item): item is string => typeof item === "string");
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? "yes" : "no";
  return answer.valueText ?? "";
}

function fileRef(file: {
  fieldKey: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}): ApplicationFileRef {
  return {
    fieldKey: file.fieldKey,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
  };
}

export async function processApplicantDeadlineClosure(closedAt = new Date()) {
  const nominations = await prisma.nominationApplication.findMany({
    where: {
      paymentStatus: "PAID",
      status: { in: ["PURCHASED", "DRAFT", "SUBMITTED"] },
      deletedAt: null,
      lockedAt: null,
    },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      category: { select: { slug: true } },
      answers: true,
      files: { where: { deletedAt: null } },
    },
  });

  let autoSubmitted = 0;
  let lockedSubmitted = 0;
  let incompleteClosed = 0;

  await prisma.$transaction(async (tx) => {
    await tx.siteSetting.upsert({
      where: { key: APPLICANT_APPLICATIONS_CLOSED_AT_KEY },
      update: { value: closedAt.toISOString() },
      create: { key: APPLICANT_APPLICATIONS_CLOSED_AT_KEY, value: closedAt.toISOString() },
    });

    for (const nomination of nominations) {
      const values: ApplicationValues = {};
      for (const answer of nomination.answers) {
        values[answer.fieldKey] = answerValue(answer);
      }
      for (const file of nomination.files) {
        const current = values[file.fieldKey];
        const refs = Array.isArray(current) ? current.filter(isApplicationFileRef) : [];
        values[file.fieldKey] = [...refs, fileRef(file)];
      }

      const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
      const hasRequirements = fields.some((field) => field.required);
      const validation = validateNominationBlockB(nomination.category.slug, values);
      const complete = hasRequirements ? Object.keys(validation).length === 0 : true;

      if (!complete && nomination.status !== "SUBMITTED") {
        await tx.nominationApplication.update({
          where: { id: nomination.id },
          data: {
            lockedAt: closedAt,
            closedIncompleteAt: closedAt,
            status: "LOCKED",
          },
        });
        incompleteClosed += 1;
        continue;
      }

      await tx.nominationApplication.update({
        where: { id: nomination.id },
        data: {
          status: nomination.status === "SUBMITTED" ? "SUBMITTED" : "SUBMITTED",
          submittedAt: nomination.submittedAt ?? closedAt,
          lockedAt: closedAt,
        },
      });
      if (nomination.status === "SUBMITTED") {
        lockedSubmitted += 1;
      } else {
        autoSubmitted += 1;
      }
    }
  });

  return {
    processed: nominations.length,
    autoSubmitted,
    lockedSubmitted,
    incompleteClosed,
    closedAt,
  };
}
