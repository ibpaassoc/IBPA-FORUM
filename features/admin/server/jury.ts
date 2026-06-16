import "server-only";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getAppSession } from "@/auth";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { normalizeJuryEmail } from "@/features/jury/server/auth";
import type { DraftScoreInput, SubmitScoreInput } from "@/features/admin/actions/scoring_schemas";
import { prisma } from "@/shared/lib/prisma";
import {
  calculateTotalScore,
  getJuryScoreListStatus,
  getScoreableApplicationsWhere,
  isEligibleScoringJudge,
  requireActiveJuryJudge,
  ScoringHttpError,
  serializeScoreValues,
  type ActiveJudgeContext,
} from "@/features/admin/server/shared";

export type JuryDashboardApplicationRecord = {
  id: string; // nominationApplicationId — used as URL [id] param
  fullName: string;
  email: string;
  city: string;
  country: string;
  createdAt: Date;
  submittedAt: Date | null;
  category: { name: string };
  award: { name: string };
  scoreStatus: "NOT_STARTED" | "DRAFT" | "SUBMITTED";
  scoreId: string | null;
};

export type JuryNominationScoringRecord = Prisma.NominationApplicationGetPayload<{
  include: {
    award: true;
    category: true;
    answers: true;
    files: true;
    application: {
      include: {
        answers: true;
        files: true;
      };
    };
  };
}>;

// Kept for any legacy imports
export type JuryScoringApplicationRecord = Prisma.ApplicationGetPayload<{
  include: {
    category: true;
    award: true;
    answers: true;
    files: true;
  };
}>;

const SCORE_DETAIL_SELECT = {
  id: true,
  technical: true,
  aesthetic: true,
  creativity: true,
  impact: true,
  presentation: true,
  totalScore: true,
  comment: true,
  status: true,
  submittedAt: true,
  updatedAt: true,
} as const;

async function getAccessibleNominationForJudge({
  nominationApplicationId,
  judge,
}: {
  nominationApplicationId: string;
  judge: ActiveJudgeContext;
}) {
  const nomination = await prisma.nominationApplication.findFirst({
    where: {
      id: nominationApplicationId,
      application: getScoreableApplicationsWhere(),
      category: { name: { in: judge.expertiseAreas } },
    },
    select: {
      id: true,
      applicationId: true,
      category: { select: { slug: true, name: true } },
    },
  });

  if (!nomination) {
    throw new ScoringHttpError(404, "The participant application could not be found.");
  }

  return nomination;
}

export async function getJudgeAssignedApplications({
  judge,
  category,
}: {
  judge: ActiveJudgeContext;
  category?: string;
}) {
  const activeCategory =
    category && judge.expertiseAreas.includes(category) ? category : undefined;

  const nominations = await prisma.nominationApplication.findMany({
    where: {
      application: getScoreableApplicationsWhere(),
      category: activeCategory
        ? { name: activeCategory }
        : { name: { in: judge.expertiseAreas } },
    },
    orderBy: [
      { application: { submittedAt: "desc" } },
      { application: { createdAt: "desc" } },
    ],
    select: {
      id: true,
      application: {
        select: {
          fullName: true,
          email: true,
          city: true,
          country: true,
          createdAt: true,
          submittedAt: true,
        },
      },
      category: { select: { name: true } },
      award: { select: { name: true } },
      judgeScores: {
        where: { judgeId: judge.juryApplicationId },
        select: { id: true, status: true },
      },
    },
  });

  const scoredNominations = nominations.filter(
    (nom) => nom.judgeScores[0]?.status === "SUBMITTED"
  ).length;

  const dashboardApplications: JuryDashboardApplicationRecord[] = nominations.map((nom) => ({
    id: nom.id,
    fullName: nom.application.fullName,
    email: nom.application.email,
    city: nom.application.city,
    country: nom.application.country,
    createdAt: nom.application.createdAt,
    submittedAt: nom.application.submittedAt,
    category: nom.category,
    award: nom.award,
    scoreId: nom.judgeScores[0]?.id ?? null,
    scoreStatus: getJuryScoreListStatus(nom.judgeScores[0] ?? null),
  }));

  return {
    judge: {
      fullName: judge.fullName,
      professionalTitle: judge.professionalTitle,
      expertiseAreas: judge.expertiseAreas,
    },
    activeCategory,
    applications: dashboardApplications,
    totals: {
      totalAssignedApplications: nominations.length,
      scoredApplications: scoredNominations,
      remainingApplications: Math.max(nominations.length - scoredNominations, 0),
      categories: judge.expertiseAreas.length,
    },
  };
}

export async function getJudgeApplicationScoringDetail({
  judge,
  nominationApplicationId,
}: {
  judge: ActiveJudgeContext;
  nominationApplicationId: string;
}) {
  const nomination = await prisma.nominationApplication.findFirst({
    where: {
      id: nominationApplicationId,
      application: getScoreableApplicationsWhere(),
      category: { name: { in: judge.expertiseAreas } },
    },
    include: {
      award: true,
      category: true,
      answers: { orderBy: { createdAt: "asc" } },
      files: { orderBy: { createdAt: "asc" } },
      judgeScores: {
        where: { judgeId: judge.juryApplicationId },
        select: SCORE_DETAIL_SELECT,
      },
      application: {
        include: {
          answers: { orderBy: { createdAt: "asc" } },
          files: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!nomination) {
    throw new ScoringHttpError(404, "The participant application could not be found.");
  }

  const score = nomination.judgeScores[0] ?? null;

  return {
    nomination: nomination as JuryNominationScoringRecord,
    categoryFields: categoryFieldConfigs[nomination.category.slug] ?? [],
    score:
      score === null
        ? null
        : {
            ...serializeScoreValues(score),
            id: score.id,
            totalScore: score.totalScore,
            comment: score.comment,
            status: score.status,
            submittedAt: score.submittedAt,
            updatedAt: score.updatedAt,
          },
  };
}

export async function saveJudgeScoreDraft({
  judge,
  nominationApplicationId,
  input,
}: {
  judge: ActiveJudgeContext;
  nominationApplicationId: string;
  input: DraftScoreInput;
}) {
  const nomination = await getAccessibleNominationForJudge({ nominationApplicationId, judge });

  const existingScore = await prisma.judgeScore.findFirst({
    where: { nominationApplicationId, judgeId: judge.juryApplicationId },
    select: { id: true, status: true },
  });

  if (existingScore?.status === "SUBMITTED") {
    throw new ScoringHttpError(409, "Submitted scores are locked until an admin reopens them.");
  }

  const totalScore = calculateTotalScore(input);
  const scoreData = {
    technical: input.technical ?? null,
    aesthetic: input.aesthetic ?? null,
    creativity: input.creativity ?? null,
    impact: input.impact ?? null,
    presentation: input.presentation ?? null,
    totalScore,
    comment: input.comment ?? null,
    status: "DRAFT" as const,
    submittedAt: null,
  };

  let score;
  if (existingScore) {
    score = await prisma.judgeScore.update({
      where: { id: existingScore.id },
      data: scoreData,
      select: SCORE_DETAIL_SELECT,
    });
  } else {
    score = await prisma.judgeScore.create({
      data: {
        applicationId: nomination.applicationId,
        nominationApplicationId,
        judgeId: judge.juryApplicationId,
        ...scoreData,
      },
      select: SCORE_DETAIL_SELECT,
    });
  }

  revalidatePath("/jury/dashboard");
  revalidatePath(`/jury/dashboard/applications/${nominationApplicationId}`);
  revalidatePath("/admin/scoring");
  revalidatePath(`/admin/scoring/${nomination.applicationId}`);

  return score;
}

export async function submitJudgeScore({
  judge,
  nominationApplicationId,
  input,
}: {
  judge: ActiveJudgeContext;
  nominationApplicationId: string;
  input: SubmitScoreInput;
}) {
  const nomination = await getAccessibleNominationForJudge({ nominationApplicationId, judge });

  const existingScore = await prisma.judgeScore.findFirst({
    where: { nominationApplicationId, judgeId: judge.juryApplicationId },
    select: { id: true, status: true },
  });

  if (existingScore?.status === "SUBMITTED") {
    throw new ScoringHttpError(409, "You have already submitted a final score for this application.");
  }

  const totalScore = calculateTotalScore(input);

  if (totalScore === null) {
    throw new ScoringHttpError(400, "All five scores are required for final submission.");
  }

  const submittedAt = new Date();
  const scoreData = {
    technical: input.technical,
    aesthetic: input.aesthetic,
    creativity: input.creativity,
    impact: input.impact,
    presentation: input.presentation,
    totalScore,
    comment: input.comment ?? null,
    status: "SUBMITTED" as const,
    submittedAt,
  };

  let score;
  if (existingScore) {
    score = await prisma.judgeScore.update({
      where: { id: existingScore.id },
      data: scoreData,
      select: SCORE_DETAIL_SELECT,
    });
  } else {
    score = await prisma.judgeScore.create({
      data: {
        applicationId: nomination.applicationId,
        nominationApplicationId,
        judgeId: judge.juryApplicationId,
        ...scoreData,
      },
      select: SCORE_DETAIL_SELECT,
    });
  }

  revalidatePath("/jury/dashboard");
  revalidatePath(`/jury/dashboard/applications/${nominationApplicationId}`);
  revalidatePath("/admin/scoring");
  revalidatePath(`/admin/scoring/${nomination.applicationId}`);

  return score;
}

export async function getAuthenticatedJudgeScoringContext() {
  return requireActiveJuryJudge();
}

export async function getAuthenticatedJudgeScoringApiContext(): Promise<ActiveJudgeContext> {
  const session = await getAppSession();

  if (!session?.user?.email) {
    throw new ScoringHttpError(401, "Judge authentication is required.");
  }

  const account = await prisma.juryAccount.findUnique({
    where: {
      email: normalizeJuryEmail(session.user.email),
    },
    include: {
      juryApplication: {
        select: {
          id: true,
          fullName: true,
          professionalTitle: true,
          expertiseAreas: true,
          status: true,
          paymentStatus: true,
        },
      },
    },
  });

  if (!account?.juryApplication) {
    throw new ScoringHttpError(401, "Judge authentication is required.");
  }

  if (!isEligibleScoringJudge(account.juryApplication.status)) {
    throw new ScoringHttpError(
      403,
      "Only approved judges can access the scoring workspace."
    );
  }

  return {
    accountId: account.id,
    email: account.email,
    juryApplicationId: account.juryApplication.id,
    fullName: account.juryApplication.fullName,
    professionalTitle: account.juryApplication.professionalTitle,
    expertiseAreas: account.juryApplication.expertiseAreas,
  };
}
