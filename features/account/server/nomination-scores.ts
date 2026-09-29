import "server-only";

import { notFound } from "next/navigation";
import { buildOfficialAwardRanks } from "@/features/admin/lib/scoring-ranking";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { getScoreableNominationsWhere } from "@/features/jury/server/scoring-shared";
import { readReviewScores, resolveNominationScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { prisma } from "@/shared/lib/prisma";

export async function getApplicantNominationScores(nominationId: string) {
  const { account, applicantProfile } = await requireApplicantAccount();
  activateRequestDataScope({ dataScope: account.dataScope });

  const nomination = await prisma.nomination.findFirst({
    where: { id: nominationId, applicantProfileId: applicantProfile.id, status: { not: "ARCHIVED" } },
    select: {
      id: true, awardId: true, status: true, updatedAt: true, scoresReleasedAt: true,
      scoringSchema: true,
      award: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      reviews: {
        where: { status: "SUBMITTED" },
        orderBy: { submittedAt: "asc" },
        select: {
          id: true, totalScore: true, scoreData: true, comments: true,
          juryProfile: { select: { fullName: true } },
        },
      },
    },
  });
  if (!nomination) notFound();

  // Release is the authorization boundary. Draft review content and peer data
  // must never be sent to the applicant before an administrator publishes scores.
  if (!nomination.scoresReleasedAt) {
    return {
      id: nomination.id, awardName: nomination.award.name,
      categoryName: nomination.category.name, status: nomination.status,
      updatedAt: nomination.updatedAt.toISOString(), released: false as const,
    };
  }

  const definition = resolveNominationScoringDefinition(nomination.scoringSchema, nomination.category.slug);
  const reviews = nomination.reviews
    .filter((review) => review.totalScore !== null)
    .map((review) => ({
      id: review.id,
      judgeName: review.juryProfile.fullName,
      total: Number(review.totalScore),
      scores: readReviewScores(review.scoreData, definition),
      comments: review.comments?.trim() ?? "",
    }));
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.total, 0) / reviews.length
    : null;

  const [peers, activeJudgeCount] = await Promise.all([
    prisma.nomination.findMany({
      where: { ...getScoreableNominationsWhere(), awardId: nomination.awardId },
      select: {
        id: true, awardId: true,
        reviews: { where: { status: "SUBMITTED" }, select: { totalScore: true } },
      },
    }),
    prisma.juryProfile.count({
      where: {
        approvedCategories: { has: nomination.category.name },
        juryApplication: { status: { in: ["APPROVED", "PAID"] } },
      },
    }),
  ]);
  const ranks = buildOfficialAwardRanks(peers.map((peer) => {
    const totals = peer.reviews.flatMap((review) => review.totalScore === null ? [] : [Number(review.totalScore)]);
    return {
      id: peer.id, awardId: peer.awardId,
      averageScore: totals.length ? totals.reduce((sum, total) => sum + total, 0) / totals.length : null,
    };
  }));

  return {
    id: nomination.id, awardName: nomination.award.name,
    categoryName: nomination.category.name, status: nomination.status,
    updatedAt: nomination.updatedAt.toISOString(), released: true as const,
    average, rank: ranks.get(nomination.id) ?? null,
    assignedJudgeCount: Math.max(activeJudgeCount, reviews.length),
    maximumTotal: definition.maximumTotal,
    criteria: definition.criteria.map(({ key, label, maxScore }) => ({ key, label, maxScore })),
    reviews,
  };
}
