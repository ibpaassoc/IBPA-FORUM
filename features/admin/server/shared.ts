import "server-only";

import type { JudgeScore, Prisma, ScoreStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { requireJuryAuth } from "@/features/jury/server/auth";

export const SCOREABLE_APPLICATION_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
] as const;

export type JuryScoreListStatus = "NOT_STARTED" | "DRAFT" | "SUBMITTED";
export type AdminScoringStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";

export type ScoreValues = {
  technical: number | null;
  aesthetic: number | null;
  creativity: number | null;
  impact: number | null;
  presentation: number | null;
};

export type ActiveJudgeContext = {
  accountId: string;
  email: string;
  juryApplicationId: string;
  fullName: string;
  professionalTitle: string;
  expertiseAreas: string[];
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

export function getScoreableApplicationsWhere() {
  const statuses = [...SCOREABLE_APPLICATION_STATUSES];

  return {
    paymentStatus: "PAID" as const,
    status: {
      in: statuses,
    },
  } satisfies Prisma.ApplicationWhereInput;
}

export function calculateTotalScore(values: Partial<ScoreValues>) {
  const scoreValues = [
    values.technical,
    values.aesthetic,
    values.creativity,
    values.impact,
    values.presentation,
  ];

  const presentValues = scoreValues.filter(
    (value): value is number => typeof value === "number"
  );

  if (presentValues.length === 0) {
    return null;
  }

  return presentValues.reduce((sum, value) => sum + value, 0);
}

export function getJuryScoreListStatus(
  score: Pick<JudgeScore, "status"> | null
): JuryScoreListStatus {
  if (!score) {
    return "NOT_STARTED";
  }

  if (score.status === "SUBMITTED") {
    return "SUBMITTED";
  }

  return "DRAFT";
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

export function getSubmittedJudgeCount(scores: Array<Pick<JudgeScore, "status">>) {
  return scores.filter((score) => score.status === "SUBMITTED").length;
}

export function getAverageSubmittedScore(
  scores: Array<Pick<JudgeScore, "status" | "totalScore">>
) {
  const submittedScores = scores.filter(
    (score): score is Pick<JudgeScore, "status" | "totalScore"> & { totalScore: number } =>
      score.status === "SUBMITTED" && typeof score.totalScore === "number"
  );

  if (submittedScores.length === 0) {
    return null;
  }

  const total = submittedScores.reduce((sum, score) => sum + score.totalScore, 0);
  return total / submittedScores.length;
}

export function formatAverageScore(value: number | null) {
  if (value === null) {
    return "Not scored";
  }

  return value.toFixed(1);
}

export async function requireActiveJuryJudge() {
  const juryUser = await requireJuryAuth();

  const juryApplication = await prisma.juryApplication.findUnique({
    where: {
      id: juryUser.juryApplicationId,
    },
    select: {
      id: true,
      fullName: true,
      professionalTitle: true,
      expertiseAreas: true,
      status: true,
      paymentStatus: true,
    },
  });

  if (!juryApplication) {
    redirect("/account/login");
  }

  if (!isEligibleScoringJudge(juryApplication.status)) {
    redirect("/account/login");
  }

  return {
    accountId: juryUser.id,
    email: juryUser.email,
    juryApplicationId: juryApplication.id,
    fullName: juryApplication.fullName,
    professionalTitle: juryApplication.professionalTitle,
    expertiseAreas: juryApplication.expertiseAreas,
  } satisfies ActiveJudgeContext;
}

export async function getScoringApplicationOrNotFound({
  applicationId,
  expertiseAreas,
}: {
  applicationId: string;
  expertiseAreas: string[];
}) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ...getScoreableApplicationsWhere(),
      category: {
        name: {
          in: expertiseAreas,
        },
      },
    },
    include: {
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

  if (!application) {
    notFound();
  }

  return application;
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

export function serializeScoreValues(score: Partial<ScoreValues>) {
  return {
    technical: score.technical ?? null,
    aesthetic: score.aesthetic ?? null,
    creativity: score.creativity ?? null,
    impact: score.impact ?? null,
    presentation: score.presentation ?? null,
  } satisfies ScoreValues;
}

export function getScoreStatusLabel(status: ScoreStatus) {
  return status.replaceAll("_", " ");
}
