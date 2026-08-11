import "server-only";

import { notFound } from "next/navigation";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { nominationValuesFromStorage } from "@/features/applications/lib/nomination-values";
import { computeNominationProgress } from "@/features/account/lib/nomination-progress";
import { prisma } from "@/shared/lib/prisma";
import { editableNominationStatus } from "@/features/database/nomination-status";
import { nominationAnswerViewRows, nominationFileViewRows } from "@/features/database/json-fields";

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
    // Measured with the editor's own progress rules so this badge cannot claim a
    // nomination is complete that the submit endpoint would reject.
    const progress = computeNominationProgress(
      nomination.category.slug,
      categoryFieldConfigs[nomination.category.slug] ?? [],
      nominationValuesFromStorage(
        nominationAnswerViewRows(nomination.answers),
        nominationFileViewRows(nomination.files),
      ),
    );

    return {
      id: nomination.id,
      status: nomination.status,
      locked: nomination.status === "LOCKED",
      categoryName: nomination.category.name,
      awardName: nomination.award.name,
      completionPercentage: progress.percentage,
      missingRequiredCount: progress.issues.length,
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
