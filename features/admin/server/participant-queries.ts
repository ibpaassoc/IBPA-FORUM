import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { validateNominationBlockB } from "@/features/applications/schemas/category-field-validation";
import type { ApplicationFileRef, ApplicationValues } from "@/features/applications/types/application.types";
import { prisma } from "@/shared/lib/prisma";
import { adminT } from "@/lib/i18n/admin";

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
  if (Array.isArray(answer.valueJson)) {
    return answer.valueJson.filter((item): item is string => typeof item === "string");
  }
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

function nominationValues(nomination: {
  answers: AnswerLike[];
  files: FileLike[];
}) {
  const values: ApplicationValues = {};
  for (const answer of nomination.answers) {
    values[answer.fieldKey] = answerValue(answer);
  }
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
  const values = nominationValues(nomination);
  const errors = validateNominationBlockB(nomination.category.slug, values);
  const missingRequiredCount = Object.keys(errors).length;
  const completeRequiredCount = Math.max(requiredFields.length - missingRequiredCount, 0);
  const completionPercent =
    requiredFields.length === 0
      ? 100
      : Math.round((completeRequiredCount / requiredFields.length) * 100);

  return {
    completionPercent,
    missingRequiredCount,
  };
}

function aggregateStatus(nominations: Array<{ status: string }>) {
  const statuses = nominations.map((nomination) => nomination.status);
  if (statuses.includes("UNDER_REVIEW")) return "UNDER_REVIEW";
  if (statuses.includes("SCORED")) return "SCORED";
  if (statuses.includes("SUBMITTED")) return "SUBMITTED";
  if (statuses.includes("LOCKED")) return "LOCKED";
  if (statuses.includes("RETURNED_FOR_CHANGES")) return "RETURNED_FOR_CHANGES";
  if (statuses.includes("DRAFT")) return "DRAFT";
  if (statuses.includes("PURCHASED")) return "PURCHASED";
  return statuses[0] ?? "DRAFT";
}

function aggregatePaymentStatus(nominations: Array<{ paymentStatus: string }>) {
  const statuses = nominations.map((nomination) => nomination.paymentStatus);
  if (statuses.length === 0) return "PENDING";
  if (statuses.every((status) => status === "PAID")) return "PAID";
  if (statuses.includes("FAILED")) return "FAILED";
  if (statuses.includes("EXPIRED")) return "EXPIRED";
  if (statuses.includes("REFUNDED")) return "REFUNDED";
  return "PENDING";
}

export async function getParticipantApplications(status?: string) {
  const profiles = await prisma.applicantProfile.findMany({
    where: {
      deletedAt: null,
      account: { role: "APPLICANT", deletedAt: null },
    },
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
        where: { deletedAt: null },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          category: { select: { name: true } },
          award: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const applications = profiles
    .map((profile) => {
      const statusValue = aggregateStatus(profile.nominations);
      const paymentStatus = aggregatePaymentStatus(profile.nominations);
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
        category: profile.nominations[0]?.category ?? { name: adminT.system.applicantAccount },
        award: profile.nominations[0]?.award ?? { name: adminT.system.noNominations },
        registrationEligible: !profile.account.passwordHash && profile.account.status !== "DISABLED",
        setupEmailNeedsAttention:
          !profile.account.passwordHash &&
          Boolean(profile.account.lastSetupEmailDeliveryStatus) &&
          profile.account.lastSetupEmailDeliveryStatus !== "delivered",
        nominationApplications: profile.nominations,
      };
    })
    .filter((row) => (!status || row.status === status));

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
          select: {
            id: true,
            email: true,
            status: true,
            passwordHash: true,
            lastSetupEmailSentAt: true,
            lastSetupEmailDeliveryStatus: true,
            lastSetupEmailDeliveryError: true,
            setupTokenExpiresAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        nominations: {
          where: { deletedAt: null },
          include: {
            award: true,
            category: true,
            answers: { orderBy: { createdAt: "asc" } },
            files: {
              where: { deletedAt: null },
              orderBy: { createdAt: "asc" },
            },
            purchasePayment: true,
            judgeScores: {
              select: {
                id: true,
                status: true,
                totalScore: true,
                submittedAt: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    }),
    prisma.category.findMany({
      include: {
        awards: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!profile) return null;

  return {
    profile: {
      ...profile,
      nominations: profile.nominations.map((nomination) => ({
        ...nomination,
        completion: completionForNomination(nomination),
      })),
    },
    categories,
  };
}
