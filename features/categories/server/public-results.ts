import "server-only";

import { buildOfficialAwardRanks } from "@/features/admin/lib/scoring-ranking";
import { getScoreableNominationsWhere } from "@/features/jury/server/scoring-shared";
import { prisma } from "@/shared/lib/prisma";

/** A released nomination is the public boundary; unreleased names and scores stay server-side. */
export async function getPublicAwardResults() {
  const nominations = await prisma.nomination.findMany({
    where: { ...getScoreableNominationsWhere(), dataScope: "PRODUCTION" },
    select: {
      id: true,
      awardId: true,
      scoresReleasedAt: true,
      applicantProfile: { select: { fullName: true } },
      reviews: {
        where: { status: "SUBMITTED", dataScope: "PRODUCTION" },
        select: { totalScore: true },
      },
    },
  });

  const scored = nominations.map((nomination) => {
    const totals = nomination.reviews.flatMap((review) =>
      review.totalScore === null ? [] : [Number(review.totalScore)],
    );
    return {
      id: nomination.id,
      awardId: nomination.awardId,
      name: nomination.applicantProfile.fullName,
      released: nomination.scoresReleasedAt !== null,
      averageScore: totals.length
        ? totals.reduce((sum, total) => sum + total, 0) / totals.length
        : null,
    };
  });
  const ranks = buildOfficialAwardRanks(scored);

  return scored
    .filter((nomination) => nomination.released && nomination.averageScore !== null)
    .map((nomination) => ({
      id: nomination.id,
      awardId: nomination.awardId,
      name: nomination.name,
      place: ranks.get(nomination.id) ?? null,
      averageScore: nomination.averageScore!,
    }))
    .sort((left, right) =>
      left.awardId.localeCompare(right.awardId) ||
      (left.place ?? Number.MAX_SAFE_INTEGER) - (right.place ?? Number.MAX_SAFE_INTEGER) ||
      left.name.localeCompare(right.name),
    );
}

export type PublicAwardResult = Awaited<ReturnType<typeof getPublicAwardResults>>[number];
