import "server-only";

import { notFound } from "next/navigation";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { prisma } from "@/shared/lib/prisma";

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
