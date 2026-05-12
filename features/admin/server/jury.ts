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
  id: string;
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

export type JuryScoringApplicationRecord = Prisma.ApplicationGetPayload<{
  include: {
    category: true;
    award: true;
    answers: true;
    files: true;
  };
}>;

async function getAccessibleApplicationForJudge({
  applicationId,
  judge,
}: {
  applicationId: string;
  judge: ActiveJudgeContext;
}) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ...getScoreableApplicationsWhere(),
      category: {
        name: {
          in: judge.expertiseAreas,
        },
      },
    },
    select: {
      id: true,
      category: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
  });

  if (!application) {
    throw new ScoringHttpError(404, "The participant application could not be found.");
  }

  return application;
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

  const where = {
    ...getScoreableApplicationsWhere(),
    category: activeCategory
      ? {
          name: activeCategory,
        }
      : {
          name: {
            in: judge.expertiseAreas,
          },
        },
  };

  const applications = await prisma.application.findMany({
    where,
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
      fullName: true,
      email: true,
      city: true,
      country: true,
      createdAt: true,
      submittedAt: true,
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
      judgeScores: {
        where: {
          judgeId: judge.juryApplicationId,
        },
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  const scoredApplications = applications.filter(
    (application) => application.judgeScores[0]?.status === "SUBMITTED"
  ).length;

  const dashboardApplications: JuryDashboardApplicationRecord[] = applications.map(
    (application) => ({
      id: application.id,
      fullName: application.fullName,
      email: application.email,
      city: application.city,
      country: application.country,
      createdAt: application.createdAt,
      submittedAt: application.submittedAt,
      category: application.category,
      award: application.award,
      scoreId: application.judgeScores[0]?.id ?? null,
      scoreStatus: getJuryScoreListStatus(application.judgeScores[0] ?? null),
    })
  );

  return {
    judge: {
      fullName: judge.fullName,
      professionalTitle: judge.professionalTitle,
      expertiseAreas: judge.expertiseAreas,
    },
    activeCategory,
    applications: dashboardApplications,
    totals: {
      totalAssignedApplications: applications.length,
      scoredApplications,
      remainingApplications: Math.max(applications.length - scoredApplications, 0),
      categories: judge.expertiseAreas.length,
    },
  };
}

export async function getJudgeApplicationScoringDetail({
  judge,
  applicationId,
}: {
  judge: ActiveJudgeContext;
  applicationId: string;
}) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ...getScoreableApplicationsWhere(),
      category: {
        name: {
          in: judge.expertiseAreas,
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
      judgeScores: {
        where: {
          judgeId: judge.juryApplicationId,
        },
        select: {
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
        },
      },
    },
  });

  if (!application) {
    throw new ScoringHttpError(404, "The participant application could not be found.");
  }

  const score = application.judgeScores[0] ?? null;

  return {
    application: application as JuryScoringApplicationRecord,
    categoryFields: categoryFieldConfigs[application.category.slug] ?? [],
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
  applicationId,
  input,
}: {
  judge: ActiveJudgeContext;
  applicationId: string;
  input: DraftScoreInput;
}) {
  await getAccessibleApplicationForJudge({
    applicationId,
    judge,
  });

  const existingScore = await prisma.judgeScore.findUnique({
    where: {
      applicationId_judgeId: {
        applicationId,
        judgeId: judge.juryApplicationId,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (existingScore?.status === "SUBMITTED") {
    throw new ScoringHttpError(
      409,
      "Submitted scores are locked until an admin reopens them."
    );
  }

  const totalScore = calculateTotalScore(input);

  const score = await prisma.judgeScore.upsert({
    where: {
      applicationId_judgeId: {
        applicationId,
        judgeId: judge.juryApplicationId,
      },
    },
    create: {
      applicationId,
      judgeId: judge.juryApplicationId,
      technical: input.technical ?? null,
      aesthetic: input.aesthetic ?? null,
      creativity: input.creativity ?? null,
      impact: input.impact ?? null,
      presentation: input.presentation ?? null,
      totalScore,
      comment: input.comment ?? null,
      status: "DRAFT",
      submittedAt: null,
    },
    update: {
      technical: input.technical ?? null,
      aesthetic: input.aesthetic ?? null,
      creativity: input.creativity ?? null,
      impact: input.impact ?? null,
      presentation: input.presentation ?? null,
      totalScore,
      comment: input.comment ?? null,
      status: "DRAFT",
      submittedAt: null,
    },
    select: {
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
    },
  });

  revalidatePath("/jury/dashboard");
  revalidatePath(`/jury/dashboard/applications/${applicationId}`);
  revalidatePath("/admin/scoring");
  revalidatePath(`/admin/scoring/${applicationId}`);

  return score;
}

export async function submitJudgeScore({
  judge,
  applicationId,
  input,
}: {
  judge: ActiveJudgeContext;
  applicationId: string;
  input: SubmitScoreInput;
}) {
  await getAccessibleApplicationForJudge({
    applicationId,
    judge,
  });

  const existingScore = await prisma.judgeScore.findUnique({
    where: {
      applicationId_judgeId: {
        applicationId,
        judgeId: judge.juryApplicationId,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (existingScore?.status === "SUBMITTED") {
    throw new ScoringHttpError(
      409,
      "You have already submitted a final score for this application."
    );
  }

  const totalScore = calculateTotalScore(input);

  if (totalScore === null) {
    throw new ScoringHttpError(400, "All five scores are required for final submission.");
  }

  const submittedAt = new Date();

  const score = await prisma.judgeScore.upsert({
    where: {
      applicationId_judgeId: {
        applicationId,
        judgeId: judge.juryApplicationId,
      },
    },
    create: {
      applicationId,
      judgeId: judge.juryApplicationId,
      technical: input.technical,
      aesthetic: input.aesthetic,
      creativity: input.creativity,
      impact: input.impact,
      presentation: input.presentation,
      totalScore,
      comment: input.comment ?? null,
      status: "SUBMITTED",
      submittedAt,
    },
    update: {
      technical: input.technical,
      aesthetic: input.aesthetic,
      creativity: input.creativity,
      impact: input.impact,
      presentation: input.presentation,
      totalScore,
      comment: input.comment ?? null,
      status: "SUBMITTED",
      submittedAt,
    },
    select: {
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
    },
  });

  revalidatePath("/jury/dashboard");
  revalidatePath(`/jury/dashboard/applications/${applicationId}`);
  revalidatePath("/admin/scoring");
  revalidatePath(`/admin/scoring/${applicationId}`);

  return score;
}

export async function getAuthenticatedJudgeScoringContext() {
  return requireActiveJuryJudge();
}

export async function getAuthenticatedJudgeScoringApiContext() {
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
  } satisfies ActiveJudgeContext;
}
