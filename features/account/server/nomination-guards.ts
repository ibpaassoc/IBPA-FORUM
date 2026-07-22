import "server-only";

import { notFound } from "next/navigation";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { prisma } from "@/shared/lib/prisma";

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
  const nominations = await prisma.nominationApplication.findMany({
    where: { applicantProfileId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      lockedAt: true,
      category: { select: { name: true, slug: true } },
      award: { select: { name: true } },
      answers: { select: { fieldKey: true } },
      files: { where: { deletedAt: null }, select: { fieldKey: true } },
    },
  });

  return nominations.map((nomination) => {
    const requiredFields = (categoryFieldConfigs[nomination.category.slug] ?? []).filter(
      (field) => field.required,
    );
    const answeredKeys = new Set(nomination.answers.map((answer) => answer.fieldKey));
    const fileKeys = new Set(nomination.files.map((file) => file.fieldKey));
    const missingRequiredCount = requiredFields.filter((field) =>
      field.type === "file" ? !fileKeys.has(field.key) : !answeredKeys.has(field.key),
    ).length;

    return {
      id: nomination.id,
      status: nomination.status,
      locked: nomination.lockedAt !== null || nomination.status === "LOCKED",
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
  const { applicantProfile } = await requireApplicantAccount();

  const nomination = await prisma.nominationApplication.findFirst({
    where: {
      id: nominationId,
      applicantProfileId: applicantProfile.id,
    },
    include: {
      category: true,
      award: true,
      answers: { orderBy: { createdAt: "asc" } },
      files: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
      reviews: {
        where: { status: "COMPLETED" },
        select: {
          totalScore: true,
          completedAt: true,
        },
      },
    },
  });

  if (!nomination) {
    notFound();
  }

  return { nomination, applicantProfile };
}

export async function requireEditableNomination(nominationId: string) {
  const context = await requireOwnedNomination(nominationId);
  const { nomination } = context;

  if (nomination.lockedAt || nomination.status === "LOCKED") {
    throw new Response("Nomination is locked.", { status: 409 });
  }

  return context;
}
