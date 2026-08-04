import "server-only";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import type { DraftReviewInput, SubmitReviewInput } from "@/features/jury/schemas/review.schema";
import { prisma } from "@/shared/lib/prisma";
import { syncScoreOnChange } from "@/features/google-sheets";
import {
  getJuryReviewListStatus,
  isEligibleScoringJudge,
  requireActiveJuryJudge,
  ScoringHttpError,
  type ActiveJudgeContext,
} from "@/features/jury/server/scoring-shared";
import { requireJuryAuth } from "@/features/jury/server/auth";
import {
  buildReviewScoreData,
  calculateReviewTotal,
  readReviewScores,
  resolveNominationScoringDefinition,
  validateReviewScores,
  type NominationScoringDefinition,
  type ReviewScores,
} from "@/features/jury/scoring/category-scoring";

export type JuryNominationFilter = "all" | "pending" | "in-progress" | "completed";

export type JuryNominationListItem = {
  id: string;
  applicantName: string;
  applicantWebsite: string | null;
  createdAt: Date;
  submittedAt: Date | null;
  category: { name: string };
  award: { name: string };
  reviewStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "LOCKED";
  reviewId: string | null;
  totalScore: number | null;
  maximumScore: number;
  reviewUpdatedAt: Date | null;
};

export type JuryNominationReviewRecord = {
  id: string;
  applicant: {
    fullName: string;
    website: string | null;
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
    award: { name: string };
    category: { name: string };
    reviewStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "LOCKED";
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

function toReviewResponse(review: {
  id: string;
  scoreData: Prisma.JsonValue | null;
  totalScore: Prisma.Decimal | null;
  notes: string | null;
  status: string;
  completedAt: Date | null;
  updatedAt: Date;
}, definition: NominationScoringDefinition) {
  return {
    scores: readReviewScores(review.scoreData, definition),
    id: review.id,
    totalScore: review.totalScore === null ? null : Number(review.totalScore),
    comment: review.notes,
    status: getJuryReviewListStatus(review),
    completedAt: review.completedAt,
    updatedAt: review.updatedAt,
  };
}

async function getAccessibleNominationForJury({
  nominationId,
  judge,
}: {
  nominationId: string;
  judge: ActiveJudgeContext;
}) {
  const nomination = await prisma.nominationApplication.findFirst({
    where: {
      id: nominationId,
      paymentStatus: "PAID",
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
      closedIncompleteAt: null,
      deletedAt: null,
      category: { name: { in: judge.approvedCategories } },
    },
    select: {
      id: true,
      scoringSchema: true,
      category: { select: { slug: true, name: true } },
    },
  });

  if (!nomination) {
    throw new ScoringHttpError(404, "The nomination could not be found.");
  }

  return nomination;
}

export async function getJuryNominationWorkspace({
  judge,
  category,
  status = "all",
}: {
  judge: ActiveJudgeContext;
  category?: string;
  status?: JuryNominationFilter;
}) {
  const activeCategory =
    category && judge.approvedCategories.includes(category) ? category : undefined;

  const nominations = await prisma.nominationApplication.findMany({
    where: {
      paymentStatus: "PAID",
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
      closedIncompleteAt: null,
      deletedAt: null,
      category: { name: { in: judge.approvedCategories } },
    },
    orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
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
      scoringSchema: true,
      category: { select: { name: true, slug: true } },
      award: { select: { name: true } },
      reviews: {
        where: { juryProfileId: judge.juryProfileId },
        select: {
          id: true,
          status: true,
          totalScore: true,
          updatedAt: true,
        },
      },
    },
  });

  const allNominations: JuryNominationListItem[] = nominations.map((nomination) => {
    const review = nomination.reviews[0] ?? null;
    const scoringDefinition = resolveNominationScoringDefinition(
      nomination.scoringSchema,
      nomination.category.slug
    );
    return {
      id: nomination.id,
      applicantName: nomination.applicantProfile?.fullName ?? "Applicant",
      applicantWebsite: nomination.applicantProfile?.websiteUrl ?? null,
      createdAt: nomination.createdAt,
      submittedAt: nomination.submittedAt,
      category: nomination.category,
      award: nomination.award,
      reviewId: review?.id ?? null,
      reviewStatus: getJuryReviewListStatus(review),
      totalScore: review?.totalScore === null || review?.totalScore === undefined
        ? null
        : Number(review.totalScore),
      maximumScore: scoringDefinition.maximumTotal,
      reviewUpdatedAt: review?.updatedAt ?? null,
    };
  });

  const visibleNominations = allNominations.filter((nomination) => {
    if (activeCategory && nomination.category.name !== activeCategory) return false;
    if (status === "pending") return nomination.reviewStatus === "NOT_STARTED";
    if (status === "in-progress") return nomination.reviewStatus === "IN_PROGRESS";
    if (status === "completed") {
      return nomination.reviewStatus === "COMPLETED" || nomination.reviewStatus === "LOCKED";
    }
    return true;
  });

  const completedCount = allNominations.filter(
    (nomination) => nomination.reviewStatus === "COMPLETED" || nomination.reviewStatus === "LOCKED",
  ).length;
  const inProgressCount = allNominations.filter(
    (nomination) => nomination.reviewStatus === "IN_PROGRESS",
  ).length;
  const notStartedCount = allNominations.filter(
    (nomination) => nomination.reviewStatus === "NOT_STARTED",
  ).length;

  return {
    judge: {
      fullName: judge.fullName,
      professionalTitle: judge.professionalTitle,
      approvedCategories: judge.approvedCategories,
    },
    activeCategory,
    activeStatus: status,
    nominations: visibleNominations,
    allNominations,
    totals: {
      assigned: allNominations.length,
      completed: completedCount,
      inProgress: inProgressCount,
      notStarted: notStartedCount,
      remaining: Math.max(allNominations.length - completedCount, 0),
      completionPercentage: allNominations.length === 0
        ? 0
        : Math.round((completedCount / allNominations.length) * 100),
      categories: judge.approvedCategories.length,
    },
  };
}

export async function getJuryNominationReviewDetail({
  judge,
  nominationId,
}: {
  judge: ActiveJudgeContext;
  nominationId: string;
}) {
  const nomination = await prisma.nominationApplication.findFirst({
    where: {
      id: nominationId,
      paymentStatus: "PAID",
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
      closedIncompleteAt: null,
      deletedAt: null,
      category: { name: { in: judge.approvedCategories } },
    },
    select: {
      id: true,
      applicantProfileId: true,
      scoringSchema: true,
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
    throw new ScoringHttpError(404, "The nomination could not be found.");
  }

  const review = nomination.reviews[0] ?? null;
  const scoringDefinition = resolveNominationScoringDefinition(
    nomination.scoringSchema,
    nomination.category.slug
  );
  const peerNominations = nomination.applicantProfileId
    ? await prisma.nominationApplication.findMany({
        where: {
          applicantProfileId: nomination.applicantProfileId,
          paymentStatus: "PAID",
          status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
          closedIncompleteAt: null,
          deletedAt: null,
          category: { name: { in: judge.approvedCategories } },
        },
        select: {
          id: true,
          award: { select: { name: true } },
          category: { select: { name: true } },
          reviews: {
            where: { juryProfileId: judge.juryProfileId },
            select: { status: true },
          },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return {
    nomination: {
      id: nomination.id,
      applicant: {
        fullName: nomination.applicantProfile?.fullName ?? "Applicant",
        website: nomination.applicantProfile?.websiteUrl ?? null,
      },
      award: nomination.award,
      category: nomination.category,
      answers: nomination.answers,
      files: nomination.files,
      peerNominations: peerNominations.map((peer) => ({
        id: peer.id,
        award: peer.award,
        category: peer.category,
        reviewStatus: getJuryReviewListStatus(peer.reviews[0] ?? null),
      })),
    } satisfies JuryNominationReviewRecord,
    categoryFields: categoryFieldConfigs[nomination.category.slug] ?? [],
    scoringDefinition,
    review: review === null ? null : toReviewResponse(review, scoringDefinition),
  };
}

export async function saveJuryReviewDraft({
  judge,
  nominationId,
  input,
}: {
  judge: ActiveJudgeContext;
  nominationId: string;
  input: DraftReviewInput;
}) {
  const nomination = await getAccessibleNominationForJury({ nominationId, judge });
  const scoringDefinition = resolveNominationScoringDefinition(
    nomination.scoringSchema,
    nomination.category.slug
  );

  const existingReview = await prisma.juryNominationReview.findUnique({
    where: {
      nominationId_juryProfileId: {
        nominationId,
        juryProfileId: judge.juryProfileId,
      },
    },
    select: { id: true, status: true },
  });

  if (existingReview?.status === "COMPLETED" || existingReview?.status === "LOCKED") {
    throw new ScoringHttpError(409, "Completed reviews are locked until an admin reopens them.");
  }

  let scoreValues: ReviewScores;
  try {
    scoreValues = validateReviewScores({
      scores: input.scores,
      definition: scoringDefinition,
      requireComplete: false,
    });
  } catch (error) {
    throw new ScoringHttpError(400, error instanceof Error ? error.message : "Invalid scores.");
  }
  const totalScore = calculateReviewTotal(scoreValues);
  const reviewData = {
    scoreData: buildReviewScoreData(scoringDefinition, scoreValues) as Prisma.InputJsonValue,
    totalScore,
    notes: input.comment ?? null,
    status: "IN_PROGRESS" as const,
    completedAt: null,
  };

  let review;
  if (existingReview) {
    review = await prisma.juryNominationReview.update({
      where: { id: existingReview.id },
      data: reviewData,
      select: REVIEW_DETAIL_SELECT,
    });
  } else {
    review = await prisma.juryNominationReview.create({
      data: {
        nominationId,
        juryProfileId: judge.juryProfileId,
        ...reviewData,
        startedAt: new Date(),
      },
      select: REVIEW_DETAIL_SELECT,
    });
  }

  revalidatePath("/account/jury");
  revalidatePath("/account/jury/nominations");
  revalidatePath(`/account/jury/nominations/${nominationId}`);
  revalidatePath("/account/jury/completed");
  revalidatePath("/admin/scoring");
  revalidatePath(`/admin/scoring/${nominationId}`);

  syncScoreOnChange(review.id);

  return toReviewResponse(review, scoringDefinition);
}

export async function submitJuryReview({
  judge,
  nominationId,
  input,
}: {
  judge: ActiveJudgeContext;
  nominationId: string;
  input: SubmitReviewInput;
}) {
  const nomination = await getAccessibleNominationForJury({ nominationId, judge });
  const scoringDefinition = resolveNominationScoringDefinition(
    nomination.scoringSchema,
    nomination.category.slug
  );

  const existingReview = await prisma.juryNominationReview.findUnique({
    where: {
      nominationId_juryProfileId: {
        nominationId,
        juryProfileId: judge.juryProfileId,
      },
    },
    select: { id: true, status: true },
  });

  if (existingReview?.status === "COMPLETED" || existingReview?.status === "LOCKED") {
    throw new ScoringHttpError(409, "You have already completed this nomination review.");
  }

  let scoreValues: ReviewScores;
  try {
    scoreValues = validateReviewScores({
      scores: input.scores,
      definition: scoringDefinition,
      requireComplete: true,
    });
  } catch (error) {
    throw new ScoringHttpError(400, error instanceof Error ? error.message : "Invalid scores.");
  }
  const totalScore = calculateReviewTotal(scoreValues);

  if (totalScore === null) {
    throw new ScoringHttpError(400, "Every regulation criterion is required for final submission.");
  }

  const submittedAt = new Date();
  const reviewData = {
    scoreData: buildReviewScoreData(scoringDefinition, scoreValues) as Prisma.InputJsonValue,
    totalScore,
    notes: input.comment ?? null,
    status: "COMPLETED" as const,
    startedAt: existingReview ? undefined : submittedAt,
    completedAt: submittedAt,
  };

  let review;
  if (existingReview) {
    review = await prisma.juryNominationReview.update({
      where: { id: existingReview.id },
      data: reviewData,
      select: REVIEW_DETAIL_SELECT,
    });
  } else {
    review = await prisma.juryNominationReview.create({
      data: {
        nominationId,
        juryProfileId: judge.juryProfileId,
        ...reviewData,
      },
      select: REVIEW_DETAIL_SELECT,
    });
  }

  revalidatePath("/account/jury");
  revalidatePath("/account/jury/nominations");
  revalidatePath(`/account/jury/nominations/${nominationId}`);
  revalidatePath("/account/jury/completed");
  revalidatePath("/admin/scoring");
  revalidatePath(`/admin/scoring/${nominationId}`);

  syncScoreOnChange(review.id, { refreshStats: true });

  return toReviewResponse(review, scoringDefinition);
}

export const getAuthenticatedJuryContext = cache(requireActiveJuryJudge);

export async function getAuthenticatedJuryApiContext(): Promise<ActiveJudgeContext> {
  const juryUser = await requireJuryAuth();

  const account = await prisma.account.findUnique({
    where: { id: juryUser.id },
    include: {
      juryProfile: {
        select: {
          id: true,
          juryApplicationId: true,
          fullName: true,
          professionalTitle: true,
          approvedCategories: true,
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

  if (account.juryProfile.approvedCategories.length === 0) {
    throw new ScoringHttpError(403, "At least one approved category is required.");
  }

  return {
    accountId: account.id,
    email: account.email,
    juryProfileId: account.juryProfile.id,
    juryApplicationId: account.juryProfile.juryApplicationId,
    fullName: account.juryProfile.fullName,
    professionalTitle: account.juryProfile.professionalTitle ?? "",
    approvedCategories: account.juryProfile.approvedCategories,
  };
}
