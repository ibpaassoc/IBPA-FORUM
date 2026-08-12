"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { issueApplicantRegistrationLink } from "@/features/account/server/applicant-registration";
import {
  APPLICANT_NOMINATION_PURCHASE_FLOW,
  APPLICANT_PURCHASE_MANIFEST_VERSION,
} from "@/features/applications/server/purchase-workflow";
import { processApplicantDeadlineClosure } from "@/features/applications/server/closure";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { prisma } from "@/shared/lib/prisma";
import { adminT } from "@/lib/i18n/admin";
import { syncApplicationOnChange } from "@/features/google-sheets";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { emptyNominationAnswers, emptyStoredFiles } from "@/features/database/json-fields";
import { parseApplicantDeadlineDateTimeLocal } from "@/features/applications/lib/deadline-timezone";
import { getApplicantApplicationsClosedAt } from "@/features/applications/server/deadlines";
import {
  assertNominationStatusTransition,
  editableNominationStatus,
} from "@/features/database/nomination-status";

function adminApplicationsPath(params?: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return query ? `/admin/applications?${query}` : "/admin/applications";
}

function adminApplicantPath(profileId: string, params?: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return query ? `/admin/applications/${profileId}?${query}` : `/admin/applications/${profileId}`;
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getOptionalString(formData: FormData, key: string) {
  return getString(formData, key) || null;
}

function parseOptionalInt(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function parseOverrideDate(value: string) {
  return parseApplicantDeadlineDateTimeLocal(value);
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function updateApplicantProfileAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  if (!profileId) {
    redirect(adminApplicationsPath({ error: adminT.actions.missingApplicantId }));
  }

  const fullName = getString(formData, "fullName");
  const city = getString(formData, "city");
  const country = getString(formData, "country");
  const yearsExperience = parseOptionalInt(getString(formData, "yearsExperience"));

  if (!fullName || !city || !country) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.applicantRequiredFields }));
  }

  if (Number.isNaN(yearsExperience)) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.yearsWholeNumber }));
  }

  await prisma.applicantProfile.update({
    where: { id: profileId },
    data: {
      fullName,
      phone: getOptionalString(formData, "phone"),
      country,
      stateProvince: getOptionalString(formData, "stateProvince"),
      city,
      professionalTitle: getOptionalString(formData, "professionalTitle"),
      yearsExperience,
      membershipNumber: getOptionalString(formData, "membershipNumber"),
      membershipLevel: getOptionalString(formData, "membershipLevel"),
      preferredLocale: getString(formData, "preferredLocale") || "en",
      websiteUrl: getOptionalString(formData, "websiteUrl"),
      socialUrl: getOptionalString(formData, "socialUrl"),
      reviewsUrl: getOptionalString(formData, "reviewsUrl"),
    },
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);
  syncApplicationOnChange(profileId);
  redirect(adminApplicantPath(profileId, { notice: adminT.actions.applicantUpdated }));
}

export async function resendApplicantRegistrationLinkAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  if (!profileId) {
    redirect(adminApplicationsPath({ error: adminT.actions.missingApplicantId }));
  }

  const profile = await prisma.applicantProfile.findUnique({
    where: { id: profileId },
    select: { accountId: true },
  });

  if (!profile) {
    redirect(adminApplicationsPath({ error: adminT.actions.applicantNotFound }));
  }

  const result = await issueApplicantRegistrationLink({ accountId: profile.accountId });
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);

  if (result.status === "ineligible" || result.status === "cooldown") {
    redirect(adminApplicantPath(profileId, { notice: adminT.actions.registrationIneligible }));
  }

  if (result.status === "delivery_failed") {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.registrationDeliveryFailed }));
  }

  redirect(adminApplicantPath(profileId, { notice: adminT.actions.registrationSent }));
}

export async function bulkResendApplicantRegistrationLinksAction(formData: FormData) {
  await requireAdmin();

  const profileIds = formData
    .getAll("profileIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (profileIds.length === 0) {
    redirect(adminApplicationsPath({ error: adminT.actions.selectApplicant }));
  }

  const profiles = await prisma.applicantProfile.findMany({
    where: { id: { in: profileIds } },
    select: { id: true, accountId: true },
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of profiles) {
    const result = await issueApplicantRegistrationLink({ accountId: profile.accountId });
    if (result.status === "ineligible" || result.status === "cooldown") {
      skipped += 1;
    } else if (result.status === "sent") {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  revalidatePath("/admin/applications");
  redirect(
    adminApplicationsPath({
      notice: adminT.actions.registrationBatch(profileIds.length, sent, skipped, failed),
    })
  );
}

export async function addManualApplicantNominationAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  const awardId = getString(formData, "awardId");

  if (!profileId || !awardId) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.chooseApplicantNomination }));
  }

  const [profile, award, duplicate] = await Promise.all([
    prisma.applicantProfile.findUnique({
      where: { id: profileId },
      include: { account: { select: { email: true } } },
    }),
    prisma.award.findUnique({
      where: { id: awardId },
      include: { category: true },
    }),
    prisma.nomination.findFirst({
      where: { applicantProfileId: profileId, awardId, status: { not: "ARCHIVED" } },
      select: { id: true },
    }),
  ]);

  if (!profile) {
    redirect(adminApplicationsPath({ error: adminT.actions.applicantNotFound }));
  }

  if (!award) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.nominationNotFound }));
  }

  if (duplicate) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.nominationAlreadyOwned }));
  }

  const paidAt = new Date();
  const manifest = {
    version: APPLICANT_PURCHASE_MANIFEST_VERSION,
    flowType: APPLICANT_NOMINATION_PURCHASE_FLOW,
    source: "admin_manual",
    locale: profile.preferredLocale || "en",
    createdAt: paidAt.toISOString(),
    applicantProfileId: profile.id,
    personalInfo: {
      fullName: profile.fullName,
      email: profile.account.email,
      phone: profile.phone,
      country: profile.country,
      stateProvince: profile.stateProvince,
      city: profile.city,
      professionalTitle: profile.professionalTitle,
      yearsExperience: profile.yearsExperience,
      websiteUrl: profile.websiteUrl,
      socialUrl: profile.socialUrl,
      reviewsUrl: profile.reviewsUrl,
    },
    membership: {
      isVerifiedMember: Boolean(profile.membershipNumber && profile.membershipLevel),
      membershipNumber: profile.membershipNumber,
      membershipLevel: profile.membershipLevel,
      verificationSource: "admin",
      verifiedAt: null,
    },
    selectedAwards: [
      {
        awardId: award.id,
        awardName: award.name,
        categoryId: award.categoryId,
        categoryName: award.category.name,
        categorySlug: award.category.slug,
      },
    ],
    pricing: {
      amountCents: 0,
      currency: "usd",
      nominationCount: 1,
      billableCount: 1,
      isIbpaMember: Boolean(profile.membershipNumber && profile.membershipLevel),
    },
  };

  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          accountId: profile.accountId,
          customerEmail: profile.account.email,
          purchaseType: "NOMINATION",
          provider: "MANUAL",
          pricingSnapshot: manifest as Prisma.InputJsonValue,
          amount: 0,
          currency: "usd",
          status: "PAID",
          paidAt,
          fulfilledAt: paidAt,
        },
        select: { id: true },
      });

      await tx.nomination.create({
        data: {
          applicantProfileId: profile.id,
          paymentId: payment.id,
          awardId: award.id,
          categoryId: award.categoryId,
          status: "DRAFT",
          answers: emptyNominationAnswers() as unknown as Prisma.InputJsonValue,
          files: emptyStoredFiles() as unknown as Prisma.InputJsonValue,
          scoringSchema: getCategoryScoringDefinition(
            award.category.slug
          ) as Prisma.InputJsonValue,
        },
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      redirect(adminApplicantPath(profileId, { error: adminT.actions.nominationAlreadyOwned }));
    }
    throw error;
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);
  syncApplicationOnChange(profileId);
  redirect(adminApplicantPath(profileId, { notice: adminT.actions.manualNominationAdded }));
}

export async function updateApplicantDeadlineOverrideAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  const override = parseOverrideDate(getString(formData, "deadlineOverrideAt"));

  if (!profileId) {
    redirect(adminApplicationsPath({ error: adminT.actions.missingApplicantId }));
  }

  if (override === undefined) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.invalidDeadline }));
  }

  const closedAt = await getApplicantApplicationsClosedAt();
  const reopensClosedNominations =
    closedAt !== null && override !== null && override > new Date();

  if (reopensClosedNominations) {
    assertNominationStatusTransition("LOCKED", "RETURNED_FOR_CHANGES");
    await prisma.$transaction([
      prisma.applicantProfile.update({
        where: { id: profileId },
        data: { deadlineOverrideAt: override },
      }),
      prisma.nomination.updateMany({
        where: {
          applicantProfileId: profileId,
          status: "LOCKED",
        },
        data: {
          status: "RETURNED_FOR_CHANGES",
          revision: { increment: 1 },
        },
      }),
    ]);
  } else {
    await prisma.applicantProfile.update({
      where: { id: profileId },
      data: { deadlineOverrideAt: override },
    });
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);
  redirect(adminApplicantPath(profileId, { notice: adminT.actions.deadlineUpdated }));
}

export async function updateNominationSubmissionAccessAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  const nominationId = getString(formData, "nominationId");
  const access = getString(formData, "access");

  if (!profileId || !nominationId) {
    redirect(adminApplicationsPath({ error: adminT.actions.nominationNotFound }));
  }

  if (access !== "open" && access !== "close") {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.invalidNominationAccess }));
  }

  const nomination = await prisma.nomination.findFirst({
    where: {
      id: nominationId,
      applicantProfileId: profileId,
      status: { not: "ARCHIVED" },
    },
    select: { id: true, status: true, revision: true },
  });

  if (!nomination) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.nominationNotFound }));
  }

  const nextStatus = access === "open" ? "RETURNED_FOR_CHANGES" : "LOCKED";
  const transitionAllowed =
    access === "open"
      ? nomination.status === "LOCKED"
      : editableNominationStatus(nomination.status);

  if (!transitionAllowed) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.nominationAccessUnavailable }));
  }

  assertNominationStatusTransition(nomination.status, nextStatus);
  const updated = await prisma.nomination.updateMany({
    where: {
      id: nomination.id,
      applicantProfileId: profileId,
      status: nomination.status,
      revision: nomination.revision,
    },
    data: {
      status: nextStatus,
      submissionOverrideOpen: access === "open",
      revision: { increment: 1 },
    },
  });

  if (updated.count !== 1) {
    redirect(adminApplicantPath(profileId, { error: adminT.actions.nominationChanged }));
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);
  syncApplicationOnChange(profileId);
  redirect(
    adminApplicantPath(profileId, {
      notice:
        access === "open"
          ? adminT.actions.nominationOpened
          : adminT.actions.nominationClosed,
    }),
  );
}

export async function closeApplicantApplicationsAction() {
  await requireAdmin();
  const result = await processApplicantDeadlineClosure();

  revalidatePath("/admin/applications");
  redirect(
    adminApplicationsPath({
      notice: adminT.actions.closureComplete(result.processed, result.autoSubmitted, result.incompleteClosed),
    })
  );
}
