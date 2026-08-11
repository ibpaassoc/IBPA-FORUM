import "server-only";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { syncScoreOnChange } from "@/features/google-sheets";
import { adminT, formatAdminDateTime } from "@/lib/i18n/admin";
import {
  buildCategoryRanks,
  formatAverageScore,
  getAdminScoringStatus,
  getAverageSubmittedScore,
  getScoreableNominationsWhere,
  getSubmittedJudgeCount,
  ScoringHttpError,
} from "@/features/jury/server/scoring-shared";
import {
  getCategoryScoringDefinition,
  readReviewScores,
  resolveNominationScoringDefinition,
} from "@/features/jury/scoring/category-scoring";
import {
  getCriteriaAverages,
  getJuryProgressPercentage,
  getReviewCompletion,
  getScoreDistribution,
  getScorePercentage,
  getScoreRange,
  getScoreSpread,
} from "@/features/admin/lib/scoring-metrics";

export type AdminScoringSort =
  | "averageScore"
  | "averageScoreAsc"
  | "category"
  | "status"
  | "progress"
  | "spread"
  | "updated"
  | "name";
export type AdminScoringFilterStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
export type AdminScoringProgressFilter = "NO_JUDGES" | "UNDER_50" | "PARTIAL" | "FULL";
export type AdminScoringApplicationRecord = {
  id: string;
  shortId: string;
  fullName: string;
  email: string;
  category: { id: string; name: string; slug: string };
  award: { id: string; name: string; categoryId: string; createdAt: Date };
};

export const ADMIN_SCORING_PAGE_SIZES = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 10;

/** Читаемый идентификатор заявки для админа: хвост cuid в верхнем регистре. */
function toShortId(id: string) {
  return id.slice(-6).toUpperCase();
}

function getSafeStatusFilter(status?: string): AdminScoringFilterStatus | undefined {
  if (status === "NOT_STARTED" || status === "IN_PROGRESS" || status === "COMPLETE") {
    return status;
  }

  return undefined;
}

function getSafeProgressFilter(progress?: string): AdminScoringProgressFilter | undefined {
  if (
    progress === "NO_JUDGES" ||
    progress === "UNDER_50" ||
    progress === "PARTIAL" ||
    progress === "FULL"
  ) {
    return progress;
  }

  return undefined;
}

function getSafeSort(sort?: string): AdminScoringSort {
  switch (sort) {
    case "averageScoreAsc":
    case "category":
    case "status":
    case "progress":
    case "spread":
    case "updated":
    case "name":
      return sort;
    // Устаревшее значение из прежних ссылок на аудит оценок.
    case "direction":
      return "category";
    default:
      return "averageScore";
  }
}

/** Балл из фильтра: число в пределах шкалы либо undefined. */
function getSafeScoreBound(value?: string) {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function getSafePageSize(perPage?: string) {
  const parsed = Number(perPage);
  return (ADMIN_SCORING_PAGE_SIZES as readonly number[]).includes(parsed)
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

/**
 * Максимальный балл категории по регламенту. В списке используем определение
 * категории, а не снимок схемы каждой номинации: снимок нужен только на
 * странице деталей, где важны конкретные критерии судьи.
 */
function getCategoryMaximumTotal(categorySlug: string, cache: Map<string, number | null>) {
  const cached = cache.get(categorySlug);
  if (cached !== undefined) {
    return cached;
  }

  let maximumTotal: number | null = null;
  try {
    maximumTotal = getCategoryScoringDefinition(categorySlug).maximumTotal;
  } catch {
    // Категория без регламента оценивания — проценты просто не показываем.
    maximumTotal = null;
  }

  cache.set(categorySlug, maximumTotal);
  return maximumTotal;
}

async function getActiveJudgeAssignments() {
  const judges = await prisma.juryProfile.findMany({
    where: {
      juryApplication: { status: {
        in: ["APPROVED", "PAID"],
      } },
    },
    select: {
      id: true,
      fullName: true,
      professionalTitle: true,
      account: { select: { email: true } },
      approvedCategories: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const countByCategory = new Map<string, number>();

  for (const judge of judges) {
    for (const category of judge.approvedCategories) {
      countByCategory.set(category, (countByCategory.get(category) ?? 0) + 1);
    }
  }

  return {
    judges,
    countByCategory,
  };
}

export async function getAdminScoringOverview({
  category,
  status,
  q,
  sort,
  minScore,
  maxScore,
  progress,
  page,
  perPage,
}: {
  category?: string;
  status?: string;
  q?: string;
  sort?: string;
  minScore?: string;
  maxScore?: string;
  progress?: string;
  page?: string;
  perPage?: string;
}) {
  const { countByCategory } = await getActiveJudgeAssignments();
  const applications = await prisma.nomination.findMany({
    where: getScoreableNominationsWhere(),
    orderBy: [
      {
        submittedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      submittedAt: true,
      applicantProfile: {
        select: {
          fullName: true,
          account: { select: { email: true } },
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      award: {
        select: {
          name: true,
        },
      },
      reviews: {
        select: {
          id: true,
          status: true,
          totalScore: true,
          submittedAt: true,
          updatedAt: true,
        },
      },
    },
  });

  const maximumTotalCache = new Map<string, number | null>();

  const enrichedApplications = applications.map((application) => {
    const assignedJudgeCount = countByCategory.get(application.category.name) ?? 0;
    const submittedJudgeCount = getSubmittedJudgeCount(application.reviews);
    const averageScore = getAverageSubmittedScore(application.reviews);
    const maximumTotal = getCategoryMaximumTotal(application.category.slug, maximumTotalCache);
    const submittedTotals = application.reviews
      .filter(
        (review) =>
          (review.status === "COMPLETED" || review.status === "LOCKED") &&
          review.totalScore !== null
      )
      .map((review) => Number(review.totalScore));
    const lastReviewActivity = application.reviews.reduce<Date | null>((latest, review) => {
      const candidate = review.submittedAt ?? review.updatedAt;
      return latest === null || candidate > latest ? candidate : latest;
    }, null);

    return {
      id: application.id,
      fullName: application.applicantProfile?.fullName ?? adminT.system.notSet,
      email: application.applicantProfile?.account?.email ?? "",
      createdAt: application.createdAt,
      submittedAt: application.submittedAt,
      categoryName: application.category.name,
      awardName: application.award.name,
      assignedJudgeCount,
      submittedJudgeCount,
      averageScore,
      maximumTotal,
      scoreRange: getScoreRange(submittedTotals),
      scoreSpread: maximumTotal === null ? null : getScoreSpread(submittedTotals, maximumTotal),
      progressPercentage: getJuryProgressPercentage({
        assignedJudgeCount,
        submittedJudgeCount,
      }),
      lastActivityAt: lastReviewActivity ?? application.submittedAt ?? application.updatedAt,
      status: getAdminScoringStatus({
        assignedJudgeCount,
        submittedJudgeCount,
      }),
    };
  });

  const ranks = buildCategoryRanks(
    enrichedApplications.map((application) => ({
      id: application.id,
      categoryName: application.categoryName,
      averageScore: application.averageScore,
      submittedAt: application.submittedAt,
      createdAt: application.createdAt,
    }))
  );

  const categories = [...new Set(enrichedApplications.map((item) => item.categoryName))].sort();
  const activeCategory = category && categories.includes(category) ? category : undefined;
  const activeStatus = getSafeStatusFilter(status);
  const activeProgress = getSafeProgressFilter(progress);
  const searchQuery = q?.trim() ?? "";
  const normalizedQuery = searchQuery.toLowerCase();
  const activeSort = getSafeSort(sort);
  const activeMinScore = getSafeScoreBound(minScore);
  const activeMaxScore = getSafeScoreBound(maxScore);

  const filteredApplications = enrichedApplications
    .filter((application) =>
      activeCategory ? application.categoryName === activeCategory : true
    )
    .filter((application) =>
      activeStatus ? application.status === activeStatus : true
    )
    .filter((application) =>
      normalizedQuery.length > 0
        ? application.fullName.toLowerCase().includes(normalizedQuery) ||
          application.email.toLowerCase().includes(normalizedQuery)
        : true
    )
    .filter((application) => {
      // Границы по баллу применимы только к номинациям с посчитанным средним.
      if (activeMinScore === undefined && activeMaxScore === undefined) {
        return true;
      }

      if (application.averageScore === null) {
        return false;
      }

      if (activeMinScore !== undefined && application.averageScore < activeMinScore) {
        return false;
      }

      return activeMaxScore === undefined || application.averageScore <= activeMaxScore;
    })
    .filter((application) => {
      switch (activeProgress) {
        case "NO_JUDGES":
          return application.assignedJudgeCount === 0;
        case "UNDER_50":
          return application.assignedJudgeCount > 0 && application.progressPercentage < 50;
        case "PARTIAL":
          return (
            application.assignedJudgeCount > 0 &&
            application.progressPercentage >= 50 &&
            application.progressPercentage < 100
          );
        case "FULL":
          return application.assignedJudgeCount > 0 && application.progressPercentage >= 100;
        default:
          return true;
      }
    });

  const statusOrder: Record<AdminScoringFilterStatus, number> = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    COMPLETE: 2,
  };

  filteredApplications.sort((left, right) => {
    switch (activeSort) {
      case "category": {
        const comparison = left.categoryName.localeCompare(right.categoryName, "ru");
        if (comparison !== 0) return comparison;
        break;
      }
      case "status": {
        const comparison = statusOrder[left.status] - statusOrder[right.status];
        if (comparison !== 0) return comparison;
        break;
      }
      case "name": {
        const comparison = left.fullName.localeCompare(right.fullName, "ru");
        if (comparison !== 0) return comparison;
        break;
      }
      case "progress": {
        const comparison = left.progressPercentage - right.progressPercentage;
        if (comparison !== 0) return comparison;
        break;
      }
      case "spread": {
        const comparison = (right.scoreSpread?.value ?? -1) - (left.scoreSpread?.value ?? -1);
        if (comparison !== 0) return comparison;
        break;
      }
      case "updated": {
        const comparison =
          (right.lastActivityAt?.getTime() ?? 0) - (left.lastActivityAt?.getTime() ?? 0);
        if (comparison !== 0) return comparison;
        break;
      }
      case "averageScoreAsc": {
        // Номинации без оценок остаются в конце списка, а не «выигрывают» ноль.
        const leftAverage = left.averageScore ?? Number.POSITIVE_INFINITY;
        const rightAverage = right.averageScore ?? Number.POSITIVE_INFINITY;
        if (leftAverage !== rightAverage) return leftAverage - rightAverage;
        break;
      }
      default:
        break;
    }

    const leftAverage = left.averageScore ?? -1;
    const rightAverage = right.averageScore ?? -1;
    if (rightAverage !== leftAverage) {
      return rightAverage - leftAverage;
    }

    return left.fullName.localeCompare(right.fullName, "ru");
  });

  const totalScoreable = enrichedApplications.length;
  const totalScored = enrichedApplications.filter(
    (application) => application.submittedJudgeCount > 0
  ).length;
  const notStartedCount = enrichedApplications.filter(
    (application) => application.status === "NOT_STARTED"
  ).length;
  const inProgressCount = enrichedApplications.filter(
    (application) => application.status === "IN_PROGRESS"
  ).length;
  const completeCount = enrichedApplications.filter(
    (application) => application.status === "COMPLETE"
  ).length;
  const totalAssignments = enrichedApplications.reduce(
    (sum, application) => sum + application.assignedJudgeCount,
    0
  );
  const totalSubmittedReviews = enrichedApplications.reduce(
    (sum, application) => sum + application.submittedJudgeCount,
    0
  );
  const averageCompletionPercentage =
    totalScoreable === 0
      ? 0
      : enrichedApplications.reduce((sum, application) => {
          if (application.assignedJudgeCount === 0) {
            return sum;
          }

          return sum + application.submittedJudgeCount / application.assignedJudgeCount;
        }, 0) / totalScoreable;

  const pageSize = getSafePageSize(perPage);
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const requestedPage = Number(page);
  const currentPage = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const pageApplications = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return {
    filters: {
      category: activeCategory,
      status: activeStatus,
      q: searchQuery,
      sort: activeSort,
      minScore: activeMinScore,
      maxScore: activeMaxScore,
      progress: activeProgress,
    },
    categories,
    stats: {
      totalScoreableApplications: totalScoreable,
      totalScoredApplications: totalScored,
      totalNotScoredApplications: Math.max(totalScoreable - totalScored, 0),
      averageCompletionPercentage: averageCompletionPercentage * 100,
      notStartedCount,
      inProgressCount,
      completeCount,
      totalAssignments,
      totalSubmittedReviews,
    },
    pagination: {
      page: currentPage,
      perPage: pageSize,
      totalPages,
      totalCount: filteredApplications.length,
      pageSizes: [...ADMIN_SCORING_PAGE_SIZES],
    },
    applications: pageApplications.map((application) => ({
      id: application.id,
      shortId: toShortId(application.id),
      fullName: application.fullName,
      email: application.email,
      categoryName: application.categoryName,
      awardName: application.awardName,
      assignedJudgeCount: application.assignedJudgeCount,
      submittedJudgeCount: application.submittedJudgeCount,
      progressPercentage: application.progressPercentage,
      averageScore: application.averageScore,
      averageScoreLabel: formatAverageScore(application.averageScore),
      averagePercentage:
        application.maximumTotal === null
          ? null
          : getScorePercentage(application.averageScore, application.maximumTotal),
      maximumTotal: application.maximumTotal,
      minScore: application.scoreRange?.min ?? null,
      maxScore: application.scoreRange?.max ?? null,
      spreadLevel: application.scoreSpread?.level ?? null,
      status: application.status,
      rank: ranks.get(application.id) ?? null,
      lastActivityLabel: formatAdminDateTime(application.lastActivityAt),
    })),
  };
}

export async function getAdminApplicationScoringDetail(nominationId: string) {
  const { judges, countByCategory } = await getActiveJudgeAssignments();

  const application = await prisma.nomination.findFirst({
    where: {
      id: nominationId,
      ...getScoreableNominationsWhere(),
    },
    include: {
      applicantProfile: {
        select: {
          fullName: true,
          account: { select: { email: true } },
        },
      },
      category: true,
      award: true,
      reviews: {
        include: {
          juryProfile: {
            select: {
              id: true,
              fullName: true,
              professionalTitle: true,
              account: { select: { email: true } },
            },
          },
        },
        orderBy: [
          {
          submittedAt: "desc",
          },
          {
            updatedAt: "desc",
          },
        ],
      },
    },
  });

  if (!application) {
    return null;
  }

  const assignedJudges = judges.filter((judge) =>
    judge.approvedCategories.includes(application.category.name)
  );
  const scoringDefinition = resolveNominationScoringDefinition(
    application.scoringSchema,
    application.category.slug
  );

  const scoreByJudgeId = new Map(application.reviews.map((score) => [score.juryProfileId, score]));
  const submittedJudgeCount = getSubmittedJudgeCount(application.reviews);
  const assignedJudgeCount = countByCategory.get(application.category.name) ?? 0;
  const averageScore = getAverageSubmittedScore(application.reviews);

  const rankingPool = await prisma.nomination.findMany({
    where: {
      ...getScoreableNominationsWhere(),
      categoryId: application.categoryId,
    },
    select: {
      id: true,
      createdAt: true,
      submittedAt: true,
      category: {
        select: {
          name: true,
        },
      },
      reviews: {
        select: {
          status: true,
          totalScore: true,
        },
      },
    },
  });

  const rankingMap = buildCategoryRanks(
    rankingPool.map((item) => ({
      id: item.id,
      categoryName: item.category.name,
      averageScore: getAverageSubmittedScore(item.reviews),
      submittedAt: item.submittedAt,
      createdAt: item.createdAt,
    }))
  );

  // Судьи категории плюс те, у кого уже есть отзыв, но категорию им больше не
  // одобрили: иначе отправленная оценка попадала бы в средний балл, но не была
  // бы видна в списке.
  const judgeRowSources = [
    ...assignedJudges.map((judge) => ({
      id: judge.id,
      fullName: judge.fullName,
      professionalTitle: judge.professionalTitle,
      email: judge.account.email,
    })),
    ...application.reviews
      .filter((review) => !assignedJudges.some((judge) => judge.id === review.juryProfileId))
      .map((review) => ({
        id: review.juryProfile.id,
        fullName: review.juryProfile.fullName,
        professionalTitle: review.juryProfile.professionalTitle,
        email: review.juryProfile.account.email,
      })),
  ];

  const judgeRows = judgeRowSources.map((judge) => {
    const review = scoreByJudgeId.get(judge.id);
    const scores = readReviewScores(review?.scoreData, scoringDefinition);
    const totalScore =
      review?.totalScore === null || review?.totalScore === undefined
        ? null
        : Number(review.totalScore);
    const scoreStatus = (
      review?.status === "COMPLETED" || review?.status === "LOCKED"
        ? "SUBMITTED"
        : review
          ? "DRAFT"
          : "NOT_STARTED"
    ) as "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REOPENED";

    return {
      judgeId: judge.id,
      judgeName: judge.fullName,
      judgeEmail: judge.email,
      judgeTitle: judge.professionalTitle,
      reviewId: review?.id ?? null,
      scores,
      completion: getReviewCompletion(scores, scoringDefinition),
      totalScore,
      totalPercentage: getScorePercentage(totalScore, scoringDefinition.maximumTotal),
      comment: review?.comments ?? null,
      scoreStatus,
      startedAtLabel: review?.startedAt ? formatAdminDateTime(review.startedAt) : null,
      submittedAtLabel: review?.submittedAt ? formatAdminDateTime(review.submittedAt) : null,
      updatedAtLabel: review ? formatAdminDateTime(review.updatedAt) : null,
      // Метки времени для клиентской сортировки — без передачи Date в клиент.
      lastActivityTime: (review?.submittedAt ?? review?.updatedAt)?.getTime() ?? 0,
    };
  });

  const submittedTotals = application.reviews
    .filter(
      (review) =>
        (review.status === "COMPLETED" || review.status === "LOCKED") &&
        review.totalScore !== null
    )
    .map((review) => Number(review.totalScore));
  const submittedScoreRows = application.reviews
    .filter((review) => review.status === "COMPLETED" || review.status === "LOCKED")
    .map((review) => readReviewScores(review.scoreData, scoringDefinition));
  const scoreSpread = getScoreSpread(submittedTotals, scoringDefinition.maximumTotal);
  const scoreRange = getScoreRange(submittedTotals);

  return {
    application: {
      id: application.id,
      shortId: toShortId(application.id),
      fullName: application.applicantProfile?.fullName ?? adminT.system.notSet,
      email: application.applicantProfile?.account?.email ?? "",
      category: application.category,
      award: application.award,
    } satisfies AdminScoringApplicationRecord,
    summary: {
      assignedJudgeCount,
      submittedJudgeCount,
      averageScore,
      averageScoreLabel: formatAverageScore(averageScore),
      averagePercentage: getScorePercentage(averageScore, scoringDefinition.maximumTotal),
      maximumTotal: scoringDefinition.maximumTotal,
      progressPercentage: getJuryProgressPercentage({
        assignedJudgeCount,
        submittedJudgeCount,
      }),
      status: getAdminScoringStatus({
        assignedJudgeCount,
        submittedJudgeCount,
      }),
      rank: rankingMap.get(application.id) ?? null,
      categorySize: rankingPool.length,
      spread: scoreSpread,
      minScore: scoreRange?.min ?? null,
      maxScore: scoreRange?.max ?? null,
    },
    scoringDefinition,
    judgeRows,
    analytics: {
      submittedCount: submittedTotals.length,
      assignedCount: assignedJudgeCount,
      maximumTotal: scoringDefinition.maximumTotal,
      distribution: getScoreDistribution(submittedTotals, scoringDefinition.maximumTotal),
      criteriaAverages: getCriteriaAverages(submittedScoreRows, scoringDefinition),
      spread: scoreSpread,
    },
  };
}

export async function reopenNominationReview(reviewId: string) {
  const existingReview = await prisma.juryNominationReview.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      id: true,
      nominationId: true,
      status: true,
    },
  });

  if (!existingReview) {
    throw new ScoringHttpError(404, adminT.api.judgeScoreNotFound);
  }

  if (existingReview.status !== "COMPLETED" && existingReview.status !== "LOCKED") {
    throw new ScoringHttpError(409, adminT.api.submittedScoresOnly);
  }

  const review = await prisma.juryNominationReview.update({
    where: {
      id: reviewId,
    },
    data: {
      status: "IN_PROGRESS",
      submittedAt: null,
    },
    select: {
      id: true,
      nominationId: true,
      status: true,
      updatedAt: true,
    },
  });

  revalidatePath("/account/jury");
  revalidatePath("/account/jury/nominations");
  revalidatePath(`/account/jury/nominations/${review.nominationId}`);
  revalidatePath("/account/jury/completed");
  revalidatePath(`/admin/scoring/${review.nominationId}`);
  revalidatePath("/admin/scoring");

  syncScoreOnChange(review.id, { refreshStats: true });

  return review;
}

export async function exportApplicationScoresCsv(nominationId: string) {
  const detail = await getAdminApplicationScoringDetail(nominationId);

  if (!detail) {
    throw new ScoringHttpError(404, adminT.api.participantApplicationNotFound);
  }

  const headers = [
    ...adminT.scoring.exportHeadersLeading,
    ...detail.scoringDefinition.criteria.map(
      (criterion) =>
        `${adminT.scoring.criteriaLabels[criterion.key] ?? criterion.label} (0-${criterion.maxScore})`
    ),
    ...adminT.scoring.exportHeadersTrailing,
  ];

  const rows = detail.judgeRows.map((row) => [
    detail.application.fullName,
    detail.application.category.name,
    detail.application.award.name,
    row.judgeName,
    row.judgeEmail,
    adminT.statuses[row.scoreStatus] ?? row.scoreStatus,
    ...detail.scoringDefinition.criteria.map(
      (criterion) => row.scores[criterion.key] ?? ""
    ),
    row.totalScore ?? "",
    row.comment ?? "",
    row.submittedAtLabel ?? "",
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}
