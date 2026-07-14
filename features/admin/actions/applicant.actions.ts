"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { createAccountSetupToken } from "@/features/account/server/tokens";
import { sendAccountSetupEmail } from "@/features/account/server/emails";
import {
  APPLICANT_NOMINATION_PURCHASE_FLOW,
  APPLICANT_PURCHASE_MANIFEST_VERSION,
} from "@/features/applications/server/purchase-workflow";
import { processApplicantDeadlineClosure } from "@/features/applications/server/closure";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { prisma } from "@/shared/lib/prisma";

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
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function issueRegistrationLink(accountId: string) {
  const payload = await prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { id: accountId },
      include: { applicantProfile: { select: { id: true, fullName: true } } },
    });

    if (
      !account ||
      account.role !== "APPLICANT" ||
      account.status === "DISABLED" ||
      account.passwordHash ||
      !account.applicantProfile
    ) {
      return null;
    }

    const token = await createAccountSetupToken(tx, {
      accountId: account.id,
      purpose: "SETUP",
    });

    return {
      accountId: account.id,
      profileId: account.applicantProfile.id,
      email: account.email,
      fullName: account.applicantProfile.fullName,
      token: token.token,
    };
  });

  if (!payload) {
    return { sent: false, skipped: true, profileId: null as string | null };
  }

  const result = await sendAccountSetupEmail({
    to: payload.email,
    fullName: payload.fullName,
    token: payload.token,
  });

  await prisma.account.update({
    where: { id: payload.accountId },
    data: {
      lastSetupEmailSentAt: new Date(),
      lastSetupEmailDeliveryStatus: result.delivered ? "delivered" : result.reason ?? "failed",
      lastSetupEmailDeliveryError: result.delivered ? null : result.error ?? result.reason ?? "Email delivery failed.",
    },
  });

  return {
    sent: result.delivered,
    skipped: false,
    profileId: payload.profileId,
    error: result.delivered ? null : result.error ?? result.reason ?? "Email delivery failed.",
  };
}

export async function updateApplicantProfileAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  if (!profileId) {
    redirect(adminApplicationsPath({ error: "Missing applicant profile id." }));
  }

  const fullName = getString(formData, "fullName");
  const city = getString(formData, "city");
  const country = getString(formData, "country");
  const yearsExperience = parseOptionalInt(getString(formData, "yearsExperience"));

  if (!fullName || !city || !country) {
    redirect(adminApplicantPath(profileId, { error: "Full name, country, and city are required." }));
  }

  if (Number.isNaN(yearsExperience)) {
    redirect(adminApplicantPath(profileId, { error: "Years of experience must be a whole number." }));
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
      membershipVerifiedAt:
        getOptionalString(formData, "membershipNumber") || getOptionalString(formData, "membershipLevel")
          ? new Date()
          : null,
      membershipVerificationSource:
        getOptionalString(formData, "membershipNumber") || getOptionalString(formData, "membershipLevel")
          ? "admin"
          : null,
      preferredLocale: getString(formData, "preferredLocale") || "en",
      websiteUrl: getOptionalString(formData, "websiteUrl"),
      socialUrl: getOptionalString(formData, "socialUrl"),
      reviewsUrl: getOptionalString(formData, "reviewsUrl"),
    },
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);
  redirect(adminApplicantPath(profileId, { notice: "Applicant profile updated." }));
}

export async function resendApplicantRegistrationLinkAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  if (!profileId) {
    redirect(adminApplicationsPath({ error: "Missing applicant profile id." }));
  }

  const profile = await prisma.applicantProfile.findUnique({
    where: { id: profileId },
    select: { accountId: true },
  });

  if (!profile) {
    redirect(adminApplicationsPath({ error: "Applicant profile not found." }));
  }

  const result = await issueRegistrationLink(profile.accountId);
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);

  if (result.skipped) {
    redirect(adminApplicantPath(profileId, { notice: "Registration link was skipped because this account is not eligible." }));
  }

  if (!result.sent) {
    redirect(adminApplicantPath(profileId, { error: "Registration link was generated, but email delivery failed." }));
  }

  redirect(adminApplicantPath(profileId, { notice: "Secure registration link sent." }));
}

export async function bulkResendApplicantRegistrationLinksAction(formData: FormData) {
  await requireAdmin();

  const profileIds = formData
    .getAll("profileIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (profileIds.length === 0) {
    redirect(adminApplicationsPath({ error: "Select at least one applicant." }));
  }

  const profiles = await prisma.applicantProfile.findMany({
    where: { id: { in: profileIds } },
    select: { id: true, accountId: true },
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of profiles) {
    const result = await issueRegistrationLink(profile.accountId);
    if (result.skipped) {
      skipped += 1;
    } else if (result.sent) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  revalidatePath("/admin/applications");
  redirect(
    adminApplicationsPath({
      notice: `Registration links processed: attempted ${profileIds.length}, sent ${sent}, skipped ${skipped}, failed ${failed}.`,
    })
  );
}

export async function addManualApplicantNominationAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  const awardId = getString(formData, "awardId");

  if (!profileId || !awardId) {
    redirect(adminApplicantPath(profileId, { error: "Choose an applicant and nomination." }));
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
    prisma.nominationApplication.findFirst({
      where: { applicantProfileId: profileId, awardId, deletedAt: null },
      select: { id: true },
    }),
  ]);

  if (!profile || profile.deletedAt) {
    redirect(adminApplicationsPath({ error: "Applicant profile not found." }));
  }

  if (!award) {
    redirect(adminApplicantPath(profileId, { error: "Nomination not found." }));
  }

  if (duplicate) {
    redirect(adminApplicantPath(profileId, { error: "You already have this nomination." }));
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
      verifiedAt: profile.membershipVerifiedAt?.toISOString() ?? null,
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
          source: "COMPETITOR",
          applicantProfileId: profile.id,
          applicantEmail: profile.account.email,
          provider: "manual_admin",
          purchaseManifest: manifest as Prisma.InputJsonValue,
          amount: 0,
          currency: "usd",
          status: "PAID",
          paidAt,
          fulfilledAt: paidAt,
        },
        select: { id: true },
      });

      await tx.nominationApplication.create({
        data: {
          applicantProfileId: profile.id,
          purchasePaymentId: payment.id,
          awardId: award.id,
          categoryId: award.categoryId,
          status: "PURCHASED",
          paymentStatus: "PAID",
          amount: 0,
          currency: "usd",
          paidAt,
        },
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      redirect(adminApplicantPath(profileId, { error: "You already have this nomination." }));
    }
    throw error;
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);
  redirect(adminApplicantPath(profileId, { notice: "Manual paid nomination added." }));
}

export async function updateApplicantDeadlineOverrideAction(formData: FormData) {
  await requireAdmin();

  const profileId = getString(formData, "profileId");
  const override = parseOverrideDate(getString(formData, "deadlineOverrideAt"));

  if (!profileId) {
    redirect(adminApplicationsPath({ error: "Missing applicant profile id." }));
  }

  if (override === undefined) {
    redirect(adminApplicantPath(profileId, { error: "Invalid deadline override date." }));
  }

  await prisma.applicantProfile.update({
    where: { id: profileId },
    data: { deadlineOverrideAt: override },
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${profileId}`);
  redirect(adminApplicantPath(profileId, { notice: "Deadline override updated." }));
}

export async function closeApplicantApplicationsAction() {
  await requireAdmin();
  const result = await processApplicantDeadlineClosure();

  revalidatePath("/admin/applications");
  redirect(
    adminApplicationsPath({
      notice: `Applications closed: processed ${result.processed}, auto-submitted ${result.autoSubmitted}, incomplete ${result.incompleteClosed}.`,
    })
  );
}
