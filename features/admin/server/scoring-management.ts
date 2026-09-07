import "server-only";

import type { Prisma } from "@prisma/client";
import { adminT, formatAdminDateTime } from "@/lib/i18n/admin";
import { getActiveJudgeAssignments } from "@/features/admin/server/admin";
import { getJuryProgressPercentage } from "@/features/admin/lib/scoring-metrics";
import { buildOfficialAwardRanks } from "@/features/admin/lib/scoring-ranking";
import {
  readReviewScores,
  resolveNominationScoringDefinition,
} from "@/features/jury/scoring/category-scoring";
import {
  isDraftReviewStatus,
  isSubmittedReviewStatus,
} from "@/features/jury/scoring/review-status";
import { getScoreableNominationsWhere } from "@/features/jury/server/scoring-shared";
import { prisma } from "@/shared/lib/prisma";
import { getDataScopeContext } from "@/features/test/server/data-scope";

export const SCORING_MANAGEMENT_PAGE_SIZES = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

type RankingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "NO_JUDGES";
export type JuryCompletionStatus = "COMPLETE" | "IN_PROGRESS" | "NOT_STARTED";
export type JuryProgressSort =
  | "completion"
  | "submitted"
  | "remaining"
  | "name"
  | "activity";

function safePage(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function safePageSize(value?: string) {
  const parsed = Number(value);
  return (SCORING_MANAGEMENT_PAGE_SIZES as readonly number[]).includes(parsed)
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

function safePercentage(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function rankingStatus(submitted: number, assigned: number): RankingStatus {
  if (assigned === 0) return "NO_JUDGES";
  if (submitted === 0) return "NOT_STARTED";
  if (submitted < assigned) return "IN_PROGRESS";
  return "COMPLETE";
}

export async function getAdminNominationRankings(input: {
  q?: string;
  award?: string;
  category?: string;
  nomination?: string;
  status?: string;
  page?: string;
  perPage?: string;
}) {
  const { dataScope } = getDataScopeContext();
  const [{ countByCategory }, nominations, aggregates] = await Promise.all([
    getActiveJudgeAssignments(),
    prisma.nomination.findMany({
      where: getScoreableNominationsWhere(),
      orderBy: [{ category: { name: "asc" } }, { award: { name: "asc" } }, { createdAt: "asc" }],
      select: {
        id: true,
        scoringSchema: true,
        applicantProfile: { select: { fullName: true } },
        category: { select: { id: true, name: true, slug: true } },
        award: { select: { id: true, name: true } },
      },
    }),
    prisma.$queryRaw<Array<{ nominationId: string; count: number; average: Prisma.Decimal | null }>>`
      SELECT "nominationId", COUNT(*)::integer AS "count", AVG("totalScore") AS "average"
      FROM "forum_next"."JuryNominationReview"
      WHERE "status"::text = 'SUBMITTED' AND "dataScope"::text = ${dataScope}
      GROUP BY "nominationId"
    `,
  ]);

  const aggregateByNomination = new Map(
    aggregates.map((aggregate) => [
      aggregate.nominationId,
      {
        count: aggregate.count,
        average: aggregate.average === null ? null : Number(aggregate.average),
      },
    ]),
  );

  const baseRows = nominations.map((nomination) => {
    const aggregate = aggregateByNomination.get(nomination.id) ?? { count: 0, average: null };
    const assigned = countByCategory.get(nomination.category.name) ?? 0;
    return {
      id: nomination.id,
      competitorName: nomination.applicantProfile?.fullName ?? adminT.system.notSet,
      category: nomination.category,
      award: nomination.award,
      assignedJudgeCount: assigned,
      submittedJudgeCount: aggregate.count,
      averageScore: aggregate.average,
      status: rankingStatus(aggregate.count, assigned),
      scoringSchema: nomination.scoringSchema,
    };
  });
  const rankById = buildOfficialAwardRanks(baseRows.map((row) => ({
    id: row.id,
    awardId: row.award.id,
    averageScore: row.averageScore,
  })));
  const peerMaxByAward = new Map<string, number>();
  for (const row of baseRows) {
    peerMaxByAward.set(
      row.award.id,
      Math.max(peerMaxByAward.get(row.award.id) ?? 0, row.submittedJudgeCount),
    );
  }

  const awards = [...new Map(baseRows.map((row) => [row.award.id, row.award])).values()];
  const categories = [...new Map(baseRows.map((row) => [row.category.id, row.category])).values()];
  const nominationOptions = baseRows.map((row) => ({
    id: row.id,
    label: `${row.competitorName} · ${row.award.name}`,
  }));
  const activeAward = awards.some((item) => item.id === input.award) ? input.award : undefined;
  const activeCategory = categories.some((item) => item.id === input.category)
    ? input.category
    : undefined;
  const activeNomination = baseRows.some((item) => item.id === input.nomination)
    ? input.nomination
    : undefined;
  const activeStatus = (["NOT_STARTED", "IN_PROGRESS", "COMPLETE", "NO_JUDGES"] as string[])
    .includes(input.status ?? "")
    ? (input.status as RankingStatus)
    : undefined;
  const query = input.q?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase("ru");

  const filtered = baseRows
    .filter((row) => !activeAward || row.award.id === activeAward)
    .filter((row) => !activeCategory || row.category.id === activeCategory)
    .filter((row) => !activeNomination || row.id === activeNomination)
    .filter((row) => !activeStatus || row.status === activeStatus)
    .filter((row) => !normalizedQuery || row.competitorName.toLocaleLowerCase("ru").includes(normalizedQuery))
    .sort((left, right) => {
      const leftRank = rankById.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = rankById.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return left.award.name.localeCompare(right.award.name, "ru") || leftRank - rightRank || left.competitorName.localeCompare(right.competitorName, "ru");
    });

  const perPage = safePageSize(input.perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(safePage(input.page), totalPages);
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);
  const reviews = pageRows.length === 0
    ? []
    : await prisma.juryNominationReview.findMany({
        where: { nominationId: { in: pageRows.map((row) => row.id) } },
        orderBy: [{ nominationId: "asc" }, { totalScore: "desc" }, { submittedAt: "asc" }],
        select: {
          id: true,
          nominationId: true,
          status: true,
          totalScore: true,
          scoreData: true,
          comments: true,
          submittedAt: true,
          juryProfile: { select: { fullName: true } },
        },
      });
  const reviewsByNomination = new Map<string, typeof reviews>();
  for (const review of reviews.filter((item) => isSubmittedReviewStatus(item.status))) {
    const group = reviewsByNomination.get(review.nominationId) ?? [];
    group.push(review);
    reviewsByNomination.set(review.nominationId, group);
  }

  return {
    filters: {
      q: query,
      award: activeAward,
      category: activeCategory,
      nomination: activeNomination,
      status: activeStatus,
    },
    options: { awards, categories, nominations: nominationOptions },
    pagination: {
      page,
      perPage,
      totalPages,
      totalCount: filtered.length,
      pageSizes: [...SCORING_MANAGEMENT_PAGE_SIZES],
    },
    rows: pageRows.map((row) => {
      const scoringDefinition = resolveNominationScoringDefinition(
        row.scoringSchema,
        row.category.slug,
      );
      return {
        id: row.id,
        place: rankById.get(row.id) ?? null,
        competitorName: row.competitorName,
        nominationName: row.award.name,
        categoryName: row.category.name,
        assignedJudgeCount: row.assignedJudgeCount,
        submittedJudgeCount: row.submittedJudgeCount,
        averageScore: row.averageScore,
        status: row.status,
        hasFewerReviewsThanPeers:
          row.submittedJudgeCount < (peerMaxByAward.get(row.award.id) ?? 0),
        criteria: scoringDefinition.criteria.map((criterion) => ({
          key: criterion.key,
          label: adminT.scoring.criteriaLabels[criterion.key] ?? criterion.label,
          maximum: criterion.maxScore,
        })),
        reviews: (reviewsByNomination.get(row.id) ?? []).map((review) => ({
          id: review.id,
          juryName: review.juryProfile.fullName,
          totalScore: review.totalScore === null ? null : Number(review.totalScore),
          scores: readReviewScores(review.scoreData, scoringDefinition),
          comment: review.comments,
          submittedAtLabel: review.submittedAt ? formatAdminDateTime(review.submittedAt) : null,
        })),
      };
    }),
  };
}

function juryStatus(submitted: number, drafts: number, assigned: number): JuryCompletionStatus {
  if (assigned > 0 && submitted === assigned) return "COMPLETE";
  if (submitted === 0 && drafts === 0) return "NOT_STARTED";
  return "IN_PROGRESS";
}

function reviewMapKey(juryProfileId: string, nominationId: string) {
  return `${juryProfileId}:${nominationId}`;
}

type ProgressInput = {
  q?: string;
  status?: string;
  award?: string;
  category?: string;
  nomination?: string;
  min?: string;
  max?: string;
  unfinished?: string;
  drafts?: string;
  quick?: string;
  sort?: string;
  page?: string;
  perPage?: string;
};

export async function getAdminJuryProgress(input: ProgressInput) {
  const [{ judges }, nominations] = await Promise.all([
    getActiveJudgeAssignments(),
    prisma.nomination.findMany({
      where: getScoreableNominationsWhere(),
      orderBy: [{ category: { name: "asc" } }, { award: { name: "asc" } }],
      select: {
        id: true,
        applicantProfile: { select: { fullName: true } },
        category: { select: { id: true, name: true } },
        award: { select: { id: true, name: true } },
      },
    }),
  ]);
  const awards = [...new Map(nominations.map((row) => [row.award.id, row.award])).values()];
  const categories = [...new Map(nominations.map((row) => [row.category.id, row.category])).values()];
  const nominationOptions = nominations.map((row) => ({
    id: row.id,
    label: `${row.applicantProfile?.fullName ?? adminT.system.notSet} · ${row.award.name}`,
  }));
  const activeAward = awards.some((item) => item.id === input.award) ? input.award : undefined;
  const activeCategory = categories.some((item) => item.id === input.category)
    ? input.category
    : undefined;
  const activeNomination = nominations.some((item) => item.id === input.nomination)
    ? input.nomination
    : undefined;
  const scopedNominations = nominations
    .filter((row) => !activeAward || row.award.id === activeAward)
    .filter((row) => !activeCategory || row.category.id === activeCategory)
    .filter((row) => !activeNomination || row.id === activeNomination);
  const reviews = judges.length === 0 || scopedNominations.length === 0
    ? []
    : await prisma.juryNominationReview.findMany({
        where: {
          juryProfileId: { in: judges.map((judge) => judge.id) },
          nominationId: { in: scopedNominations.map((nomination) => nomination.id) },
        },
        select: {
          juryProfileId: true,
          nominationId: true,
          status: true,
          submittedAt: true,
          updatedAt: true,
        },
      });
  const reviewByAssignment = new Map(reviews.map((review) => [
    reviewMapKey(review.juryProfileId, review.nominationId),
    review,
  ]));

  const query = input.q?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase("ru");
  const activeStatus = (["COMPLETE", "IN_PROGRESS", "NOT_STARTED"] as string[]).includes(input.status ?? "")
    ? (input.status as JuryCompletionStatus)
    : undefined;
  const min = safePercentage(input.min, 0);
  const max = Math.max(min, safePercentage(input.max, 100));
  const quick = (["COMPLETED", "IN_PROGRESS", "NOT_STARTED", "HAS_DRAFTS"] as string[])
    .includes(input.quick ?? "") ? input.quick : undefined;
  const sort = (["completion", "submitted", "remaining", "name", "activity"] as string[])
    .includes(input.sort ?? "") ? (input.sort as JuryProgressSort) : "completion";

  const baseRows = judges.map((judge) => {
    const assignments = scopedNominations.filter((nomination) =>
      judge.approvedCategories.includes(nomination.category.name),
    );
    let submitted = 0;
    let draft = 0;
    let lastActivityAt: Date | null = null;
    for (const nomination of assignments) {
      const review = reviewByAssignment.get(reviewMapKey(judge.id, nomination.id));
      if (!review) continue;
      if (isSubmittedReviewStatus(review.status)) submitted += 1;
      else if (isDraftReviewStatus(review.status)) draft += 1;
      const activity = review.submittedAt ?? review.updatedAt;
      if (lastActivityAt === null || activity > lastActivityAt) lastActivityAt = activity;
    }
    const assigned = assignments.length;
    const notStarted = Math.max(0, assigned - submitted - draft);
    const completion = getJuryProgressPercentage({
      assignedJudgeCount: assigned,
      submittedJudgeCount: submitted,
    });
    return {
      juryId: judge.id,
      name: judge.fullName,
      email: judge.account.email,
      title: judge.professionalTitle,
      assigned,
      submitted,
      draft,
      notStarted,
      remaining: draft + notStarted,
      completion,
      lastActivityTime: lastActivityAt?.getTime() ?? 0,
      lastActivityLabel: lastActivityAt ? formatAdminDateTime(lastActivityAt) : null,
      status: juryStatus(submitted, draft, assigned),
    };
  });
  const filtered = baseRows
    .filter((row) => !normalizedQuery || row.name.toLocaleLowerCase("ru").includes(normalizedQuery))
    .filter((row) => !activeStatus || row.status === activeStatus)
    .filter((row) => row.completion >= min && row.completion <= max)
    .filter((row) => input.unfinished !== "1" || row.remaining > 0)
    .filter((row) => input.drafts !== "1" || row.draft > 0)
    .filter((row) => quick !== "COMPLETED" || row.status === "COMPLETE")
    .filter((row) => quick !== "IN_PROGRESS" || row.status === "IN_PROGRESS")
    .filter((row) => quick !== "NOT_STARTED" || row.status === "NOT_STARTED")
    .filter((row) => quick !== "HAS_DRAFTS" || row.draft > 0)
    .sort((left, right) => {
      if (sort === "submitted") return right.submitted - left.submitted || left.name.localeCompare(right.name, "ru");
      if (sort === "remaining") return right.remaining - left.remaining || left.name.localeCompare(right.name, "ru");
      if (sort === "name") return left.name.localeCompare(right.name, "ru");
      if (sort === "activity") return right.lastActivityTime - left.lastActivityTime || left.name.localeCompare(right.name, "ru");
      return right.completion - left.completion || left.name.localeCompare(right.name, "ru");
    });

  const perPage = safePageSize(input.perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(safePage(input.page), totalPages);
  return {
    filters: {
      q: query,
      status: activeStatus,
      award: activeAward,
      category: activeCategory,
      nomination: activeNomination,
      min,
      max,
      unfinished: input.unfinished === "1",
      drafts: input.drafts === "1",
      quick,
      sort,
    },
    options: { awards, categories, nominations: nominationOptions },
    pagination: {
      page,
      perPage,
      totalPages,
      totalCount: filtered.length,
      pageSizes: [...SCORING_MANAGEMENT_PAGE_SIZES],
    },
    rows: filtered.slice((page - 1) * perPage, page * perPage),
  };
}

export async function getAdminJuryProgressDetail(juryId: string, input: {
  award?: string;
  category?: string;
  nomination?: string;
  page?: string;
  perPage?: string;
}) {
  const [{ judges }, nominations] = await Promise.all([
    getActiveJudgeAssignments(),
    prisma.nomination.findMany({
      where: getScoreableNominationsWhere(),
      orderBy: [{ category: { name: "asc" } }, { award: { name: "asc" } }],
      select: {
        id: true,
        applicantProfile: { select: { fullName: true } },
        category: { select: { id: true, name: true } },
        award: { select: { id: true, name: true } },
      },
    }),
  ]);
  const judge = judges.find((item) => item.id === juryId);
  if (!judge) return null;
  const assigned = nominations
    .filter((row) => judge.approvedCategories.includes(row.category.name))
    .filter((row) => !input.award || row.award.id === input.award)
    .filter((row) => !input.category || row.category.id === input.category)
    .filter((row) => !input.nomination || row.id === input.nomination);
  const reviews = assigned.length === 0 ? [] : await prisma.juryNominationReview.findMany({
    where: { juryProfileId: juryId, nominationId: { in: assigned.map((row) => row.id) } },
    select: { id: true, nominationId: true, status: true, totalScore: true, updatedAt: true, submittedAt: true },
  });
  const reviewByNomination = new Map(reviews.map((review) => [review.nominationId, review]));
  const rows = assigned.map((nomination) => {
    const review = reviewByNomination.get(nomination.id);
    const status = review && isSubmittedReviewStatus(review.status)
      ? "SUBMITTED"
      : review && isDraftReviewStatus(review.status)
        ? "DRAFT"
        : "NOT_STARTED";
    return {
      nominationId: nomination.id,
      competitorName: nomination.applicantProfile?.fullName ?? adminT.system.notSet,
      categoryName: nomination.category.name,
      nominationName: nomination.award.name,
      reviewId: review?.id ?? null,
      status,
      totalScore: status === "SUBMITTED" && review?.totalScore !== null && review?.totalScore !== undefined
        ? Number(review.totalScore)
        : null,
      lastActivityLabel: review ? formatAdminDateTime(review.submittedAt ?? review.updatedAt) : null,
    };
  });
  const perPage = safePageSize(input.perPage);
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const page = Math.min(safePage(input.page), totalPages);
  return {
    jury: {
      id: judge.id,
      name: judge.fullName,
      email: judge.account.email,
      title: judge.professionalTitle,
    },
    rows: rows.slice((page - 1) * perPage, page * perPage),
    pagination: {
      page,
      perPage,
      totalPages,
      totalCount: rows.length,
      pageSizes: [...SCORING_MANAGEMENT_PAGE_SIZES],
    },
  };
}
