import "server-only";

import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import { validateNominationBlockB } from "@/features/applications/schemas/category-field-validation";
import type { ApplicationFileRef, ApplicationValues } from "@/features/applications/types/application.types";
import {
  getApplicantApplicationsClosedAt,
  markApplicantApplicationsClosed,
} from "@/features/applications/server/deadlines";
import { prisma } from "@/shared/lib/prisma";
import { nominationAnswerViewRows, nominationFileViewRows, parseNominationAnswers, parseStoredFiles } from "@/features/database/json-fields";
import { assertNominationStatusTransition } from "@/features/database/nomination-status";

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

type ClosureCandidate = {
  id: string;
  revision: number;
};

type ClosureGroup = {
  closedAt: Date;
  incomplete: ClosureCandidate[];
  autoSubmit: ClosureCandidate[];
  submittedWithDate: ClosureCandidate[];
  submittedWithoutDate: ClosureCandidate[];
};

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function lockCandidates(
  candidates: ClosureCandidate[],
  statuses: Array<"DRAFT" | "RETURNED_FOR_CHANGES" | "SUBMITTED">,
  submittedAt?: Date,
) {
  let updated = 0;
  for (const batch of chunks(candidates, 400)) {
    if (batch.length === 0) continue;
    const result = await prisma.nomination.updateMany({
      where: {
        status: { in: statuses },
        OR: batch.map((candidate) => ({
          id: candidate.id,
          revision: candidate.revision,
        })),
      },
      data: {
        status: "LOCKED",
        ...(submittedAt ? { submittedAt } : {}),
        revision: { increment: 1 },
      },
    });
    updated += result.count;
  }
  return updated;
}

export async function processApplicantDeadlineClosure(
  cutoffAt = new Date(),
  options: {
    markGlobalClosure?: boolean;
    globalClosedAt?: Date;
  } = {},
) {
  const markGlobalClosure = options.markGlobalClosure ?? true;
  let globalClosedAt = await getApplicantApplicationsClosedAt();
  if (markGlobalClosure && !globalClosedAt) {
    globalClosedAt = await markApplicantApplicationsClosed(
      options.globalClosedAt ?? cutoffAt,
    );
  }
  if (!globalClosedAt) {
    throw new Error("Cannot process applicant closure before the global close is recorded.");
  }

  const nominations = await prisma.nomination.findMany({
    where: {
      payment: { status: "PAID" },
      status: { in: ["DRAFT", "RETURNED_FOR_CHANGES", "SUBMITTED"] },
      OR: [
        { applicantProfile: { deadlineOverrideAt: null } },
        { applicantProfile: { deadlineOverrideAt: { lte: cutoffAt } } },
      ],
    },
    select: {
      id: true,
      revision: true,
      status: true,
      submittedAt: true,
      applicantProfile: { select: { deadlineOverrideAt: true } },
      category: { select: { slug: true } },
      answers: true,
      files: true,
    },
  });

  const groups = new Map<string, ClosureGroup>();
  for (const nomination of nominations) {
    const nominationClosedAt =
      nomination.applicantProfile.deadlineOverrideAt ?? globalClosedAt;
    const key = nominationClosedAt.toISOString();
    const group = groups.get(key) ?? {
      closedAt: nominationClosedAt,
      incomplete: [],
      autoSubmit: [],
      submittedWithDate: [],
      submittedWithoutDate: [],
    };
    groups.set(key, group);

    assertNominationStatusTransition(nomination.status, "LOCKED");
    const candidate = { id: nomination.id, revision: nomination.revision };
    if (nomination.status === "SUBMITTED") {
      (nomination.submittedAt
        ? group.submittedWithDate
        : group.submittedWithoutDate
      ).push(candidate);
      continue;
    }

    const values: ApplicationValues = {};
    for (const answer of nominationAnswerViewRows(parseNominationAnswers(nomination.answers))) {
      values[answer.fieldKey] = answerValue(answer);
    }
    for (const file of nominationFileViewRows(parseStoredFiles(nomination.files))) {
      const current = values[file.fieldKey];
      const refs = Array.isArray(current) ? current.filter(isApplicationFileRef) : [];
      values[file.fieldKey] = [...refs, fileRef(file)];
    }

    const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
    const hasRequirements = fields.some((field) => field.required);
    const validation = validateNominationBlockB(nomination.category.slug, values);
    const complete = hasRequirements ? Object.keys(validation).length === 0 : true;
    (complete ? group.autoSubmit : group.incomplete).push(candidate);
  }

  let autoSubmitted = 0;
  let lockedSubmitted = 0;
  let incompleteClosed = 0;
  for (const group of groups.values()) {
    const [incomplete, autoSubmit, submittedWithDate, submittedWithoutDate] =
      await Promise.all([
        lockCandidates(group.incomplete, ["DRAFT", "RETURNED_FOR_CHANGES"]),
        lockCandidates(
          group.autoSubmit,
          ["DRAFT", "RETURNED_FOR_CHANGES"],
          group.closedAt,
        ),
        lockCandidates(group.submittedWithDate, ["SUBMITTED"]),
        lockCandidates(group.submittedWithoutDate, ["SUBMITTED"], group.closedAt),
      ]);
    incompleteClosed += incomplete;
    autoSubmitted += autoSubmit;
    lockedSubmitted += submittedWithDate + submittedWithoutDate;
  }

  return {
    processed: autoSubmitted + lockedSubmitted + incompleteClosed,
    autoSubmitted,
    lockedSubmitted,
    incompleteClosed,
    closedAt: globalClosedAt,
    processedAt: cutoffAt,
  };
}
