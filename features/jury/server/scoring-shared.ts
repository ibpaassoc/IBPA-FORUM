import "server-only";

import { adminT } from "@/lib/i18n/admin";

import type { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { requireJuryAuth } from "@/features/jury/server/auth";

export const SCOREABLE_NOMINATION_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "LOCKED",
  "SCORED",
] as const;

export type JuryReviewListStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "LOCKED";
export type AdminScoringStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";

export type ActiveJudgeContext = {
  accountId: string;
  email: string;
  juryProfileId: string;
  juryApplicationId: string;
  fullName: string;
  professionalTitle: string;
  approvedCategories: string[];
  dataScope: "PRODUCTION" | "TEST" | "DEV";
};

export function isEligibleScoringJudge(status: string) {
  return status === "APPROVED" || status === "PAID";
}

export class ScoringHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ScoringHttpError";
  }
}

export function getScoreableNominationsWhere() {
  const statuses = [...SCOREABLE_NOMINATION_STATUSES];

  return {
    paymentStatus: "PAID" as const,
    status: {
      in: statuses,
    },
    closedIncompleteAt: null,
    deletedAt: null,
  } satisfies Prisma.NominationApplicationWhereInput;
}

export function getJuryReviewListStatus(
  review: { status: string } | null
): JuryReviewListStatus {
  if (!review) {
    return "NOT_STARTED";
  }

  if (review.status === "LOCKED") {
    return "LOCKED";
  }

  if (review.status === "COMPLETED") {
    return "COMPLETED";
  }

  return "IN_PROGRESS";
}

export function getAdminScoringStatus({
  assignedJudgeCount,
  submittedJudgeCount,
}: {
  assignedJudgeCount: number;
  submittedJudgeCount: number;
}): AdminScoringStatus {
  if (submittedJudgeCount === 0) {
    return "NOT_STARTED";
  }

  if (assignedJudgeCount > 0 && submittedJudgeCount >= assignedJudgeCount) {
    return "COMPLETE";
  }

  return "IN_PROGRESS";
}

export function getSubmittedJudgeCount(scores: Array<{ status: string }>) {
  return scores.filter(
    (score) => score.status === "COMPLETED" || score.status === "LOCKED"
  ).length;
}

export function getAverageSubmittedScore(
  scores: Array<{ status: string; totalScore: Prisma.Decimal | number | null }>
) {
  const submittedScores = scores.filter(
    (score) =>
      (score.status === "COMPLETED" || score.status === "LOCKED") &&
      score.totalScore !== null
  );

  if (submittedScores.length === 0) {
    return null;
  }

  const total = submittedScores.reduce((sum, score) => sum + Number(score.totalScore), 0);
  return total / submittedScores.length;
}

export function formatAverageScore(value: number | null) {
  if (value === null) {
    return adminT.system.notScored;
  }

  return value.toFixed(1);
}

export async function requireActiveJuryJudge() {
  const juryUser = await requireJuryAuth();

  if (!juryUser.approvalStatus || !isEligibleScoringJudge(juryUser.approvalStatus)) {
    redirect("/");
  }

  return {
    accountId: juryUser.id,
    email: juryUser.email,
    juryProfileId: juryUser.juryProfileId,
    juryApplicationId: juryUser.juryApplicationId,
    fullName: juryUser.fullName,
    professionalTitle: juryUser.professionalTitle,
    approvedCategories: juryUser.approvedCategories,
    dataScope: juryUser.dataScope,
  } satisfies ActiveJudgeContext;
}

export async function getScoringNominationOrNotFound({
  nominationId,
  approvedCategories,
}: {
  nominationId: string;
  approvedCategories: string[];
}) {
  const nomination = await prisma.nominationApplication.findFirst({
    where: {
      id: nominationId,
      ...getScoreableNominationsWhere(),
      category: {
        name: {
          in: approvedCategories,
        },
      },
    },
    include: {
      applicantProfile: true,
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
    },
  });

  if (!nomination) {
    notFound();
  }

  return nomination;
}

export function buildCategoryRanks<T extends {
  id: string;
  categoryName: string;
  averageScore: number | null;
  submittedAt: Date | null;
  createdAt: Date;
}>(
  items: T[]
) {
  const ranks = new Map<string, number>();
  const itemsByCategory = new Map<string, T[]>();

  for (const item of items) {
    const group = itemsByCategory.get(item.categoryName) ?? [];
    group.push(item);
    itemsByCategory.set(item.categoryName, group);
  }

  for (const [, group] of itemsByCategory) {
    const rankedGroup = [...group]
      .filter((item) => item.averageScore !== null)
      .sort((left, right) => {
        if ((right.averageScore ?? -1) !== (left.averageScore ?? -1)) {
          return (right.averageScore ?? -1) - (left.averageScore ?? -1);
        }

        const leftSubmitted = left.submittedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const rightSubmitted = right.submittedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        if (leftSubmitted !== rightSubmitted) {
          return leftSubmitted - rightSubmitted;
        }

        const leftCreated = left.createdAt.getTime();
        const rightCreated = right.createdAt.getTime();
        if (leftCreated !== rightCreated) {
          return leftCreated - rightCreated;
        }

        return left.id.localeCompare(right.id);
      });

    rankedGroup.forEach((item, index) => {
      ranks.set(item.id, index + 1);
    });
  }

  return ranks;
}

