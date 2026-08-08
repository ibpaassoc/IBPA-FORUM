import "server-only";

import { notFound } from "next/navigation";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { prisma } from "@/shared/lib/prisma";
import { editableNominationStatus } from "@/features/database/nomination-status";
import { nominationAnswerViewRows, nominationFileViewRows, parseNominationAnswers, parseStoredFiles } from "@/features/database/json-fields";

export type ApplicantNominationNavigationItem = {
  id: string;
  status: string;
  locked: boolean;
  categoryName: string;
  awardName: string;
  completionPercentage: number;
  missingRequiredCount: number;
};

export async function getApplicantNominationNavigation(
  applicantProfileId: string,
): Promise<ApplicantNominationNavigationItem[]> {
  const nominations = await prisma.nomination.findMany({
    where: { applicantProfileId, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      category: { select: { name: true, slug: true } },
      award: { select: { name: true } },
      answers: true,
      files: true,
    },
  });

  return nominations.map((nomination) => {
    const requiredFields = (categoryFieldConfigs[nomination.category.slug] ?? []).filter(
      (field) => field.required,
    );
    const answeredKeys = new Set(parseNominationAnswers(nomination.answers).fields.map((answer) => answer.fieldId));
    const fileKeys = new Set(parseStoredFiles(nomination.files).items.map((file) => file.fieldId));
    const missingRequiredCount = requiredFields.filter((field) =>
      field.type === "file" ? !fileKeys.has(field.key) : !answeredKeys.has(field.key),
    ).length;

    return {
      id: nomination.id,
      status: nomination.status,
      locked: nomination.status === "LOCKED",
      categoryName: nomination.category.name,
      awardName: nomination.award.name,
      completionPercentage:
        requiredFields.length === 0
          ? 100
          : Math.round(
              ((requiredFields.length - missingRequiredCount) / requiredFields.length) * 100,
            ),
      missingRequiredCount,
    };
  });
}

export async function requireOwnedNomination(nominationId: string) {
  const { account, applicantProfile } = await requireApplicantAccount();
  activateRequestDataScope({ dataScope: account.dataScope });

  const nomination = await prisma.nomination.findFirst({
    where: {
      id: nominationId,
      applicantProfileId: applicantProfile.id,
    },
    include: {
      category: true,
      award: true,
      payment: true,
      reviews: {
        where: { status: "COMPLETED" },
        select: {
          totalScore: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!nomination) {
    notFound();
  }

  return {
    nomination: {
      ...nomination,
      answersJson: nomination.answers,
      filesJson: nomination.files,
      answers: nominationAnswerViewRows(nomination.answers),
      files: nominationFileViewRows(nomination.files),
      paymentStatus: nomination.payment.status,
      paidAt: nomination.payment.paidAt,
      locked: nomination.status === "LOCKED",
    },
    applicantProfile,
  };
}

export async function requireEditableNomination(nominationId: string) {
  const context = await requireOwnedNomination(nominationId);
  const { nomination } = context;

  if (!editableNominationStatus(nomination.status)) {
    throw new Response("Nomination is locked.", { status: 409 });
  }

  return context;
}
