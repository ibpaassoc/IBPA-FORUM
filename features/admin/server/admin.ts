import "server-only";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { syncScoreOnChange } from "@/features/google-sheets";
import { adminT } from "@/lib/i18n/admin";
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
  readReviewScores,
  resolveNominationScoringDefinition,
} from "@/features/jury/scoring/category-scoring";

export type AdminScoringSort = "averageScore" | "category" | "status";
export type AdminScoringFilterStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
export type AdminScoringApplicationRecord = {
  id: string;
  fullName: string;
  email: string;
  category: { id: string; name: string; slug: string };
  award: { id: string; name: string; categoryId: string; createdAt: Date };
};

function getSafeStatusFilter(status?: string): AdminScoringFilterStatus | undefined {
  if (status === "NOT_STARTED" || status === "IN_PROGRESS" || status === "COMPLETE") {
    return status;
  }

  return undefined;
}

function getSafeSort(sort?: string): AdminScoringSort {
  if (sort === "category" || sort === "status" || sort === "direction") {
    return sort === "direction" ? "category" : sort;
  }

  return "averageScore";
}

async function getActiveJudgeAssignments() {
  const judges = await prisma.juryProfile.findMany({
    where: {
      approvalStatus: {
        in: ["APPROVED", "PAID"],
      },
    },
    select: {
      id: true,
      fullName: true,
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
}: {
  category?: string;
  status?: string;
  q?: string;
  sort?: string;
}) {
  const { countByCategory } = await getActiveJudgeAssignments();
  const applications = await prisma.nominationApplication.findMany({
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
        },
      },
    },
  });

  const enrichedApplications = applications.map((application) => {
    const assignedJudgeCount = countByCategory.get(application.category.name) ?? 0;
    const submittedJudgeCount = getSubmittedJudgeCount(application.reviews);
    const averageScore = getAverageSubmittedScore(application.reviews);

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
  const searchQuery = q?.trim() ?? "";
  const activeSort = getSafeSort(sort);

  const filteredApplications = enrichedApplications
    .filter((application) =>
      activeCategory ? application.categoryName === activeCategory : true
    )
    .filter((application) =>
      activeStatus ? application.status === activeStatus : true
    )
    .filter((application) =>
      searchQuery.length > 0
        ? application.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  filteredApplications.sort((left, right) => {
    if (activeSort === "category") {
      const categoryComparison = left.categoryName.localeCompare(right.categoryName);
      if (categoryComparison !== 0) {
        return categoryComparison;
      }
    }

    if (activeSort === "status") {
      const leftStatus = left.status;
      const rightStatus = right.status;
      if (leftStatus !== rightStatus) {
        return leftStatus.localeCompare(rightStatus);
      }
    }

    const leftAverage = left.averageScore ?? -1;
    const rightAverage = right.averageScore ?? -1;
    if (rightAverage !== leftAverage) {
      return rightAverage - leftAverage;
    }

    return left.fullName.localeCompare(right.fullName);
  });

  const totalScoreable = enrichedApplications.length;
  const totalScored = enrichedApplications.filter(
    (application) => application.submittedJudgeCount > 0
  ).length;
  const averageCompletionPercentage =
    totalScoreable === 0
      ? 0
      : enrichedApplications.reduce((sum, application) => {
          if (application.assignedJudgeCount === 0) {
            return sum;
          }

          return sum + application.submittedJudgeCount / application.assignedJudgeCount;
        }, 0) / totalScoreable;

  return {
    filters: {
      category: activeCategory,
      status: activeStatus,
      q: searchQuery,
      sort: activeSort,
    },
    categories,
    stats: {
      totalScoreableApplications: totalScoreable,
      totalScoredApplications: totalScored,
      totalNotScoredApplications: Math.max(totalScoreable - totalScored, 0),
      averageCompletionPercentage: averageCompletionPercentage * 100,
    },
    applications: filteredApplications.map((application) => ({
      id: application.id,
      fullName: application.fullName,
      email: application.email,
      categoryName: application.categoryName,
      awardName: application.awardName,
      assignedJudgeCount: application.assignedJudgeCount,
      submittedJudgeCount: application.submittedJudgeCount,
      averageScore: application.averageScore,
      averageScoreLabel: formatAverageScore(application.averageScore),
      status: application.status,
      rank: ranks.get(application.id) ?? null,
    })),
  };
}

export async function getAdminApplicationScoringDetail(nominationId: string) {
  const { judges, countByCategory } = await getActiveJudgeAssignments();

  const application = await prisma.nominationApplication.findFirst({
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
      answers: {
        orderBy: {
          createdAt: "asc",
        },
      },
      files: {
        orderBy: {
          createdAt: "asc",
        },
      },
      reviews: {
        include: {
          juryProfile: {
            select: {
              id: true,
              fullName: true,
              account: { select: { email: true } },
            },
          },
        },
        orderBy: [
          {
          completedAt: "desc",
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

  const rankingPool = await prisma.nominationApplication.findMany({
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

  return {
    application: {
      id: application.id,
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
      status: getAdminScoringStatus({
        assignedJudgeCount,
        submittedJudgeCount,
      }),
      rank: rankingMap.get(application.id) ?? null,
    },
    scoringDefinition,
    judgeRows: assignedJudges.map((judge) => {
      const score = scoreByJudgeId.get(judge.id);

      return {
        judgeId: judge.id,
        judgeName: judge.fullName,
        judgeEmail: judge.account.email,
        scoreId: score?.id ?? null,
        scores: readReviewScores(score?.scoreData, scoringDefinition),
        totalScore: score?.totalScore === null || score?.totalScore === undefined
          ? null
          : Number(score.totalScore),
        comment: score?.notes ?? null,
        scoreStatus: (score?.status === "COMPLETED" ? "SUBMITTED" : score ? "DRAFT" : "NOT_STARTED") as
          | "NOT_STARTED"
          | "DRAFT"
          | "SUBMITTED"
          | "REOPENED",
        submittedAt: score?.completedAt ?? null,
      };
    }),
  };
}

export async function reopenJudgeScore(scoreId: string) {
  const existingScore = await prisma.juryNominationReview.findUnique({
    where: {
      id: scoreId,
    },
    select: {
      id: true,
      nominationId: true,
      status: true,
    },
  });

  if (!existingScore) {
    throw new ScoringHttpError(404, adminT.api.judgeScoreNotFound);
  }

  if (existingScore.status !== "COMPLETED" && existingScore.status !== "LOCKED") {
    throw new ScoringHttpError(409, adminT.api.submittedScoresOnly);
  }

  const score = await prisma.juryNominationReview.update({
    where: {
      id: scoreId,
    },
    data: {
      status: "IN_PROGRESS",
      completedAt: null,
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
  revalidatePath(`/account/jury/nominations/${score.nominationId}`);
  revalidatePath("/account/jury/completed");
  revalidatePath(`/admin/scoring/${score.nominationId}`);
  revalidatePath("/admin/scoring");

  syncScoreOnChange(score.id, { refreshStats: true });

  return score;
}

export async function exportApplicationScoresCsv(nominationId: string) {
  const detail = await getAdminApplicationScoringDetail(nominationId);

  if (!detail) {
    throw new ScoringHttpError(404, adminT.api.participantApplicationNotFound);
  }

  const headers = [
    ...adminT.scoring.exportHeaders.slice(0, 6),
    ...detail.scoringDefinition.criteria.map(
      (criterion) => `${criterion.label} (0-${criterion.maxScore})`
    ),
    ...adminT.scoring.exportHeaders.slice(-3),
  ];

  const rows = detail.judgeRows.map((row) => [
    detail.application.fullName,
    detail.application.category.name,
    detail.application.award.name,
    row.judgeName,
    row.judgeEmail,
    row.scoreStatus,
    ...detail.scoringDefinition.criteria.map(
      (criterion) => row.scores[criterion.key] ?? ""
    ),
    row.totalScore ?? "",
    row.comment ?? "",
    row.submittedAt?.toISOString() ?? "",
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}
