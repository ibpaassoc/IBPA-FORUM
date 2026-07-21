import "server-only";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getAppSession } from "@/auth";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import type { DraftScoreInput, SubmitScoreInput } from "@/features/admin/actions/scoring_schemas";
import { prisma } from "@/shared/lib/prisma";
import { syncScoreOnChange } from "@/features/google-sheets";
import {
  calculateTotalScore,
  getJuryScoreListStatus,
  isEligibleScoringJudge,
  requireActiveJuryJudge,
  ScoringHttpError,
  serializeScoreValues,
  type ActiveJudgeContext,
} from "@/features/admin/server/shared";

export type JuryDashboardApplicationRecord = {
  id: string; // nominationApplicationId — used as URL [id] param
  fullName: string;
  instagram: string | null;
  createdAt: Date;
  submittedAt: Date | null;
  category: { name: string };
  award: { name: string };
  scoreStatus: "NOT_STARTED" | "DRAFT" | "SUBMITTED";
  scoreId: string | null;
};

export type JuryNominationScoringRecord = {
  id: string;
  applicant: {
    fullName: string;
    instagram: string | null;
  };
  award: { id: string; name: string };
  category: { id: string; name: string; slug: string };
  answers: Array<{
    id: string;
    fieldKey: string;
    valueText: string | null;
    valueNumber: number | null;
    valueBoolean: boolean | null;
    valueJson: Prisma.JsonValue | null;
  }>;
  files: Array<{
    id: string;
    fieldKey: string;
    fileName: string;
    displayFileName: string | null;
    mimeType: string;
    fileSize: number;
  }>;
  peerNominations: Array<{
    id: string;
    awardId: string;
    createdAt: Date;
    award: { name: string };
    category: { name: string };
  }>;
};

const REVIEW_DETAIL_SELECT = {
  id: true,
  scoreData: true,
  totalScore: true,
  notes: true,
  status: true,
  completedAt: true,
  updatedAt: true,
} as const;

function getReviewScoreValues(scoreData: Prisma.JsonValue | null) {
  const values = typeof scoreData === "object" && scoreData !== null && !Array.isArray(scoreData)
    ? scoreData as Record<string, Prisma.JsonValue>
    : {};
  const numberOrNull = (key: string) => typeof values[key] === "number" ? values[key] : null;

  return {
    technical: numberOrNull("technical"),
    aesthetic: numberOrNull("aesthetic"),
    creativity: numberOrNull("creativity"),
    impact: numberOrNull("impact"),
    presentation: numberOrNull("presentation"),
  };
}

function toScoreResponse(review: {
  id: string;
  scoreData: Prisma.JsonValue | null;
  totalScore: Prisma.Decimal | null;
  notes: string | null;
  status: string;
  completedAt: Date | null;
  updatedAt: Date;
}) {
  return {
    ...serializeScoreValues(getReviewScoreValues(review.scoreData)),
    id: review.id,
    totalScore: review.totalScore === null ? null : Number(review.totalScore),
    comment: review.notes,
    status: (review.status === "COMPLETED" || review.status === "LOCKED"
      ? "SUBMITTED"
      : "DRAFT") as
      | "SUBMITTED"
      | "DRAFT",
    submittedAt: review.completedAt,
    updatedAt: review.updatedAt,
  };
}

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
      paymentStatus: "PAID",
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
      closedIncompleteAt: null,
      deletedAt: null,
      category: { name: { in: judge.expertiseAreas } },
    },
    select: {
      id: true,
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
      paymentStatus: "PAID",
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
      closedIncompleteAt: null,
      deletedAt: null,
      category: activeCategory
        ? { name: activeCategory }
        : { name: { in: judge.expertiseAreas } },
    },
    orderBy: [
      { submittedAt: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      applicantProfile: {
        select: {
          fullName: true,
          websiteUrl: true,
        },
      },
      createdAt: true,
      submittedAt: true,
      category: { select: { name: true } },
      award: { select: { name: true } },
      reviews: {
        where: { juryProfileId: judge.juryProfileId },
        select: { id: true, status: true },
      },
    },
  });

  const scoredNominations = nominations.filter(
    (nom) => nom.reviews[0]?.status === "COMPLETED"
  ).length;

  const dashboardApplications: JuryDashboardApplicationRecord[] = nominations.map((nom) => ({
    id: nom.id,
    fullName: nom.applicantProfile?.fullName ?? "Applicant",
    instagram: nom.applicantProfile?.websiteUrl ?? null,
    createdAt: nom.createdAt,
    submittedAt: nom.submittedAt,
    category: nom.category,
    award: nom.award,
    scoreId: nom.reviews[0]?.id ?? null,
    scoreStatus: getJuryScoreListStatus(nom.reviews[0] ?? null),
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
      paymentStatus: "PAID",
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
      closedIncompleteAt: null,
      deletedAt: null,
      category: { name: { in: judge.expertiseAreas } },
    },
    select: {
      id: true,
      applicantProfileId: true,
      applicantProfile: {
        select: {
          fullName: true,
          websiteUrl: true,
        },
      },
      award: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, slug: true } },
      answers: { orderBy: { createdAt: "asc" } },
      files: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          fieldKey: true,
          fileName: true,
          displayFileName: true,
          mimeType: true,
          fileSize: true,
        },
      },
      reviews: {
        where: { juryProfileId: judge.juryProfileId },
        select: REVIEW_DETAIL_SELECT,
      },
    },
  });

  if (!nomination) {
    throw new ScoringHttpError(404, "The participant application could not be found.");
  }

  const score = nomination.reviews[0] ?? null;
  const peerNominations = nomination.applicantProfileId
    ? await prisma.nominationApplication.findMany({
        where: {
          applicantProfileId: nomination.applicantProfileId,
          paymentStatus: "PAID",
          status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
          closedIncompleteAt: null,
          deletedAt: null,
        },
        select: {
          id: true,
          awardId: true,
          createdAt: true,
          award: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return {
    nomination: {
      id: nomination.id,
      applicant: {
        fullName: nomination.applicantProfile?.fullName ?? "Applicant",
        instagram: nomination.applicantProfile?.websiteUrl ?? null,
      },
      award: nomination.award,
      category: nomination.category,
      answers: nomination.answers,
      files: nomination.files,
      peerNominations,
    } satisfies JuryNominationScoringRecord,
    categoryFields: categoryFieldConfigs[nomination.category.slug] ?? [],
    score: score === null ? null : toScoreResponse(score),
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
  await getAccessibleNominationForJudge({ nominationApplicationId, judge });

  const existingScore = await prisma.juryNominationReview.findUnique({
    where: {
      nominationId_juryProfileId: {
        nominationId: nominationApplicationId,
        juryProfileId: judge.juryProfileId,
      },
    },
    select: { id: true, status: true },
  });

  if (existingScore?.status === "COMPLETED" || existingScore?.status === "LOCKED") {
    throw new ScoringHttpError(409, "Submitted scores are locked until an admin reopens them.");
  }

  const totalScore = calculateTotalScore(input);
  const scoreValues = {
    technical: input.technical ?? null,
    aesthetic: input.aesthetic ?? null,
    creativity: input.creativity ?? null,
    impact: input.impact ?? null,
    presentation: input.presentation ?? null,
  };
  const reviewData = {
    scoreData: scoreValues,
    totalScore,
    notes: input.comment ?? null,
    status: "IN_PROGRESS" as const,
    completedAt: null,
  };

  let score;
  if (existingScore) {
    score = await prisma.juryNominationReview.update({
      where: { id: existingScore.id },
      data: reviewData,
      select: REVIEW_DETAIL_SELECT,
    });
  } else {
    score = await prisma.juryNominationReview.create({
      data: {
        nominationId: nominationApplicationId,
        juryProfileId: judge.juryProfileId,
        ...reviewData,
        startedAt: new Date(),
      },
      select: REVIEW_DETAIL_SELECT,
    });
  }

  revalidatePath("/jury/dashboard");
  revalidatePath(`/jury/dashboard/applications/${nominationApplicationId}`);
  revalidatePath("/account/jury");
  revalidatePath(`/account/jury/nominations/${nominationApplicationId}`);
  revalidatePath("/admin/scoring");
  revalidatePath(`/admin/scoring/${nominationApplicationId}`);

  syncScoreOnChange(score.id);

  return toScoreResponse(score);
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
  await getAccessibleNominationForJudge({ nominationApplicationId, judge });

  const existingScore = await prisma.juryNominationReview.findUnique({
    where: {
      nominationId_juryProfileId: {
        nominationId: nominationApplicationId,
        juryProfileId: judge.juryProfileId,
      },
    },
    select: { id: true, status: true },
  });

  if (existingScore?.status === "COMPLETED" || existingScore?.status === "LOCKED") {
    throw new ScoringHttpError(409, "You have already submitted a final score for this application.");
  }

  const totalScore = calculateTotalScore(input);

  if (totalScore === null) {
    throw new ScoringHttpError(400, "All five scores are required for final submission.");
  }

  const submittedAt = new Date();
  const scoreValues = {
    technical: input.technical,
    aesthetic: input.aesthetic,
    creativity: input.creativity,
    impact: input.impact,
    presentation: input.presentation,
  };
  const reviewData = {
    scoreData: scoreValues,
    totalScore,
    notes: input.comment ?? null,
    status: "COMPLETED" as const,
    startedAt: existingScore ? undefined : submittedAt,
    completedAt: submittedAt,
  };

  let score;
  if (existingScore) {
    score = await prisma.juryNominationReview.update({
      where: { id: existingScore.id },
      data: reviewData,
      select: REVIEW_DETAIL_SELECT,
    });
  } else {
    score = await prisma.juryNominationReview.create({
      data: {
        nominationId: nominationApplicationId,
        juryProfileId: judge.juryProfileId,
        ...reviewData,
      },
      select: REVIEW_DETAIL_SELECT,
    });
  }

  revalidatePath("/jury/dashboard");
  revalidatePath(`/jury/dashboard/applications/${nominationApplicationId}`);
  revalidatePath("/account/jury");
  revalidatePath(`/account/jury/nominations/${nominationApplicationId}`);
  revalidatePath("/admin/scoring");
  revalidatePath(`/admin/scoring/${nominationApplicationId}`);

  syncScoreOnChange(score.id, { refreshStats: true });

  return toScoreResponse(score);
}

export async function getAuthenticatedJudgeScoringContext() {
  return requireActiveJuryJudge();
}

export async function getAuthenticatedJudgeScoringApiContext(): Promise<ActiveJudgeContext> {
  const session = await getAppSession();

  if (!session?.user?.accountId || session.user.role !== "JURY") {
    throw new ScoringHttpError(401, "Judge authentication is required.");
  }

  const account = await prisma.account.findUnique({
    where: { id: session.user.accountId },
    include: {
      juryProfile: {
        select: {
          id: true,
          juryApplicationId: true,
          fullName: true,
          professionalTitle: true,
          expertiseAreas: true,
          approvalStatus: true,
        },
      },
    },
  });

  if (!account?.juryProfile?.juryApplicationId) {
    throw new ScoringHttpError(401, "Judge authentication is required.");
  }

  if (!account.juryProfile.approvalStatus || !isEligibleScoringJudge(account.juryProfile.approvalStatus)) {
    throw new ScoringHttpError(
      403,
      "Only approved judges can access the scoring workspace."
    );
  }

  return {
    accountId: account.id,
    email: account.email,
    juryProfileId: account.juryProfile.id,
    juryApplicationId: account.juryProfile.juryApplicationId,
    fullName: account.juryProfile.fullName,
    professionalTitle: account.juryProfile.professionalTitle ?? "",
    expertiseAreas: account.juryProfile.expertiseAreas,
  };
}
