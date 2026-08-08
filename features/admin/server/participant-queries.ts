import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { validateNominationBlockB } from "@/features/applications/schemas/category-field-validation";
import type { ApplicationFileRef, ApplicationValues } from "@/features/applications/types/application.types";
import { nominationAnswerViewRows, nominationFileViewRows } from "@/features/database/json-fields";
import { adminT } from "@/lib/i18n/admin";
import { prisma } from "@/shared/lib/prisma";

type AnswerLike = {
  fieldKey: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
};

type FileLike = {
  fieldKey: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
};

function answerValue(answer: AnswerLike): ApplicationValues[string] {
  if (Array.isArray(answer.valueJson)) return answer.valueJson.filter((item): item is string => typeof item === "string");
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? "yes" : "no";
  return answer.valueText ?? "";
}

function fileRef(file: FileLike): ApplicationFileRef {
  return {
    fieldKey: file.fieldKey,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
  };
}

function nominationValues(nomination: { answers: AnswerLike[]; files: FileLike[] }) {
  const values: ApplicationValues = {};
  for (const answer of nomination.answers) values[answer.fieldKey] = answerValue(answer);
  for (const file of nomination.files) {
    const current = values[file.fieldKey];
    const refs = Array.isArray(current)
      ? current.filter((item): item is ApplicationFileRef => typeof item !== "string")
      : [];
    values[file.fieldKey] = [...refs, fileRef(file)];
  }
  return values;
}

function completionForNomination(nomination: {
  category: { slug: string };
  answers: AnswerLike[];
  files: FileLike[];
}) {
  const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const requiredFields = fields.filter((field) => field.required);
  const errors = validateNominationBlockB(nomination.category.slug, nominationValues(nomination));
  const missingRequiredCount = Object.keys(errors).length;
  return {
    completionPercent:
      requiredFields.length === 0
        ? 100
        : Math.round((Math.max(requiredFields.length - missingRequiredCount, 0) / requiredFields.length) * 100),
    missingRequiredCount,
  };
}

function aggregateStatus(nominations: Array<{ status: string }>) {
  const statuses = nominations.map((nomination) => nomination.status);
  for (const status of ["UNDER_REVIEW", "SCORED", "SUBMITTED", "LOCKED", "RETURNED_FOR_CHANGES", "DRAFT"]) {
    if (statuses.includes(status)) return status;
  }
  return statuses[0] ?? "DRAFT";
}

function aggregatePaymentStatus(nominations: Array<{ paymentStatus: string }>) {
  const statuses = nominations.map((nomination) => nomination.paymentStatus);
  if (statuses.length === 0) return "PENDING";
  if (statuses.every((status) => status === "PAID")) return "PAID";
  for (const status of ["FAILED", "EXPIRED", "REFUNDED"]) if (statuses.includes(status)) return status;
  return "PENDING";
}

export async function getParticipantApplications(status?: string) {
  const profiles = await prisma.applicantProfile.findMany({
    where: { account: { status: { not: "DISABLED" } } },
    orderBy: { createdAt: "desc" },
    include: {
      account: {
        select: {
          email: true,
          status: true,
          passwordHash: true,
          lastSetupEmailDeliveryStatus: true,
          lastSetupEmailDeliveryError: true,
        },
      },
      nominations: {
        where: { status: { not: "ARCHIVED" } },
        select: {
          id: true,
          status: true,
          payment: { select: { status: true } },
          category: { select: { name: true } },
          award: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const applications = profiles
    .map((profile) => {
      const nominations = profile.nominations.map((nomination) => ({
        ...nomination,
        paymentStatus: nomination.payment.status,
      }));
      const statusValue = aggregateStatus(nominations);
      const paymentStatus = aggregatePaymentStatus(nominations);
      return {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.account.email,
        city: profile.city ?? "",
        country: profile.country ?? "",
        membershipNumber: profile.membershipNumber,
        status: statusValue,
        paymentStatus,
        createdAt: profile.createdAt,
        category: nominations[0]?.category ?? { name: adminT.system.applicantAccount },
        award: nominations[0]?.award ?? { name: adminT.system.noNominations },
        registrationEligible: paymentStatus === "PAID" && !profile.account.passwordHash && profile.account.status !== "DISABLED",
        setupEmailNeedsAttention:
          !profile.account.passwordHash &&
          Boolean(profile.account.lastSetupEmailDeliveryStatus) &&
          profile.account.lastSetupEmailDeliveryStatus !== "delivered",
        nominations,
      };
    })
    .filter((row) => !status || row.status === status);

  return {
    activeStatus: status,
    applications,
    totals: {
      total: profiles.length,
      paymentPending: applications.filter((item) => item.paymentStatus !== "PAID").length,
      submitted: applications.filter((item) => item.status === "SUBMITTED").length,
      underReview: applications.filter((item) => item.status === "UNDER_REVIEW").length,
      approved: applications.filter((item) => item.status === "SCORED").length,
    },
  };
}

export async function getParticipantApplicationDetail(id: string) {
  const [profile, categories] = await Promise.all([
    prisma.applicantProfile.findUnique({
      where: { id },
      include: {
        account: {
          include: {
            payments: { orderBy: { createdAt: "desc" }, take: 20 },
          },
        },
        nominations: {
          where: { status: { not: "ARCHIVED" } },
          include: {
            award: true,
            category: true,
            payment: true,
            reviews: {
              select: { id: true, status: true, totalScore: true, submittedAt: true, comments: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      include: { awards: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!profile) return null;

  const nominations = profile.nominations.map((nomination) => {
    const answers = nominationAnswerViewRows(nomination.answers);
    const files = nominationFileViewRows(nomination.files);
    return {
      ...nomination,
      answers,
      files,
      purchasePayment: nomination.payment,
      paymentStatus: nomination.payment.status,
      paidAt: nomination.payment.paidAt,
      amount: nomination.payment.amount,
      currency: nomination.payment.currency,
      lockedAt: nomination.status === "LOCKED" ? nomination.updatedAt : null,
      reviews: nomination.reviews.map((review) => ({
        ...review,
        completedAt: review.submittedAt,
        notes: review.comments,
      })),
      completion: completionForNomination({ category: nomination.category, answers, files }),
    };
  });

  return {
    profile: {
      ...profile,
      account: { ...profile.account, payments: undefined },
      payments: profile.account.payments,
      nominations,
    },
    categories,
  };
}
