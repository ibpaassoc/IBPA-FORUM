import "server-only";

import type { AccountRole, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { getAppSession } from "@/auth";
import { prisma, unscopedPrisma } from "@/shared/lib/prisma";
import { normalizeAccountEmail } from "@/features/account/server/password";
import { createAccountSetupToken } from "@/features/account/server/tokens";
import { sendAccountSetupEmail } from "@/features/account/server/emails";
import { getTestActor } from "@/features/test/server/auth";
import { activateRequestDataScope } from "@/features/test/server/data-scope";

export function accountIdentity(email: string, role: AccountRole) {
  return { normalizedEmail_role: { normalizedEmail: normalizeAccountEmail(email), role } };
}

export async function findAccountByEmail(email: string, role: AccountRole) {
  return prisma.account.findUnique({
    where: accountIdentity(email, role),
    include: {
      applicantProfile: { select: { id: true, fullName: true } },
      juryProfile: {
        select: {
          id: true,
          juryApplicationId: true,
          fullName: true,
          expertiseAreas: true,
          approvalStatus: true,
        },
      },
    },
  });
}

/**
 * Credentials and password-reset requests begin before a request scope is
 * known. Account email is globally unique, so this guarded lookup may discover
 * PRODUCTION or DEV actors, while TEST actors remain accessible only through
 * the signed test-console impersonation flow.
 */
export async function findAccountForPublicAuth(email: string, role: AccountRole) {
  const account = await unscopedPrisma.account.findUnique({
    where: accountIdentity(email, role),
    include: {
      applicantProfile: { select: { id: true, fullName: true } },
      juryProfile: {
        select: {
          id: true,
          juryApplicationId: true,
          fullName: true,
          expertiseAreas: true,
          approvalStatus: true,
        },
      },
    },
  });

  return account?.dataScope === "TEST" ? null : account;
}

export async function findPublicAccountsByEmail(email: string) {
  const accounts = await unscopedPrisma.account.findMany({
    where: { normalizedEmail: normalizeAccountEmail(email), dataScope: { not: "TEST" } },
    select: { id: true, role: true, status: true, passwordHash: true, deletedAt: true },
  });
  return accounts;
}

export async function findAccountForPublicSession(accountId: string) {
  const account = await unscopedPrisma.account.findUnique({
    where: { id: accountId },
    select: { id: true, role: true, status: true, deletedAt: true, dataScope: true },
  });
  return account?.dataScope === "TEST" ? null : account;
}

export async function upsertApplicantAccountForApplication(
  tx: Prisma.TransactionClient,
  application: {
    fullName: string;
    email: string;
    phone?: string | null;
    country?: string | null;
    stateProvince?: string | null;
    city?: string | null;
    professionalTitle?: string | null;
    yearsExperience?: number | null;
    membershipNumber?: string | null;
    membershipLevel?: string | null;
    websiteUrl?: string | null;
    socialUrl?: string | null;
    reviewsUrl?: string | null;
  }
) {
  const email = normalizeAccountEmail(application.email);
  const existing = await tx.account.findUnique({
    where: accountIdentity(email, "APPLICANT"),
    include: { applicantProfile: true },
  });

  const account =
    existing ??
    (await tx.account.create({
      data: {
        email,
        normalizedEmail: email,
        role: "APPLICANT",
        status: "INVITED",
      },
    }));

  const profile = await tx.applicantProfile.upsert({
    where: { accountId: account.id },
    create: {
      accountId: account.id,
      fullName: application.fullName,
      phone: application.phone,
      country: application.country,
      stateProvince: application.stateProvince,
      city: application.city,
      professionalTitle: application.professionalTitle,
      yearsExperience: application.yearsExperience,
      membershipNumber: application.membershipNumber,
      membershipLevel: application.membershipLevel,
      websiteUrl: application.websiteUrl,
      socialUrl: application.socialUrl,
      reviewsUrl: application.reviewsUrl,
    },
    update: {
      fullName: application.fullName,
      phone: application.phone,
      country: application.country,
      stateProvince: application.stateProvince,
      city: application.city,
      professionalTitle: application.professionalTitle,
      yearsExperience: application.yearsExperience,
      membershipNumber: application.membershipNumber,
      membershipLevel: application.membershipLevel,
      websiteUrl: application.websiteUrl,
      socialUrl: application.socialUrl,
      reviewsUrl: application.reviewsUrl,
    },
  });

  return { account, profile };
}

export async function upsertJuryAccountForApplication(
  tx: Prisma.TransactionClient,
  application: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    country?: string | null;
    city?: string | null;
    professionalTitle?: string | null;
    yearsExperience?: number | null;
    employerAffiliation?: string | null;
    expertiseAreas: string[];
    approvedCategories: string[];
    professionalBio?: string | null;
    professionalWebsite?: string | null;
    status: "SUBMITTED" | "ADDITIONAL_INFO_REQUIRED" | "APPROVED" | "REJECTED" | "PAID";
  }
) {
  const email = normalizeAccountEmail(application.email);
  const [existing, existingProfile] = await Promise.all([
    tx.account.findUnique({
      where: accountIdentity(email, "JURY"),
      include: { juryProfile: true },
    }),
    tx.juryProfile.findUnique({
      where: { juryApplicationId: application.id },
      include: { account: true },
    }),
  ]);

  if (existingProfile) {
    const profile = await tx.juryProfile.update({
      where: { id: existingProfile.id },
      data: {
        fullName: application.fullName,
        phone: application.phone,
        country: application.country,
        city: application.city,
        professionalTitle: application.professionalTitle,
        yearsExperience: application.yearsExperience,
        employerAffiliation: application.employerAffiliation,
        expertiseAreas: application.expertiseAreas,
        approvedCategories: application.approvedCategories,
        professionalBio: application.professionalBio,
        professionalWebsite: application.professionalWebsite,
        approvalStatus: application.status,
      },
    });

    return { account: existingProfile.account, profile };
  }

  const account =
    existing ??
    (await tx.account.create({
      data: {
        email,
        normalizedEmail: email,
        role: "JURY",
        status: "INVITED",
      },
    }));

  const profile = await tx.juryProfile.upsert({
    where: { accountId: account.id },
    create: {
      accountId: account.id,
      juryApplicationId: application.id,
      fullName: application.fullName,
      phone: application.phone,
      country: application.country,
      city: application.city,
      professionalTitle: application.professionalTitle,
      yearsExperience: application.yearsExperience,
      employerAffiliation: application.employerAffiliation,
      expertiseAreas: application.expertiseAreas,
      approvedCategories: application.approvedCategories,
      professionalBio: application.professionalBio,
      professionalWebsite: application.professionalWebsite,
      approvalStatus: application.status,
    },
    update: {
      juryApplicationId: application.id,
      fullName: application.fullName,
      phone: application.phone,
      country: application.country,
      city: application.city,
      professionalTitle: application.professionalTitle,
      yearsExperience: application.yearsExperience,
      employerAffiliation: application.employerAffiliation,
      expertiseAreas: application.expertiseAreas,
      approvedCategories: application.approvedCategories,
      professionalBio: application.professionalBio,
      professionalWebsite: application.professionalWebsite,
      approvalStatus: application.status,
    },
  });

  return { account, profile };
}

export async function sendSetupEmailForAccount(accountId: string) {
  const payload = await prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { id: accountId },
      include: {
        applicantProfile: { select: { fullName: true } },
        juryProfile: { select: { fullName: true } },
      },
    });

    if (!account || account.status === "DISABLED") {
      return null;
    }

    const token = await createAccountSetupToken(tx, {
      accountId: account.id,
      purpose: "SETUP",
    });

    return {
      accountId: account.id,
      email: account.email,
      token: token.token,
      fullName: account.applicantProfile?.fullName ?? account.juryProfile?.fullName ?? null,
    };
  });

  if (!payload) {
    return null;
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

  return result;
}

export function getDashboardPathForRole(role: AccountRole) {
  return role === "JURY" ? "/account/jury" : "/account/applicant";
}

export async function requireAccount() {
  const testActor = await getTestActor();
  if (testActor) {
    activateRequestDataScope({ dataScope: "TEST" });
    const account = await prisma.account.findUnique({
      where: { id: testActor.accountId },
      include: { applicantProfile: true, juryProfile: true },
    });
    if (!account || account.role !== testActor.role || account.status === "DISABLED") {
      redirect("/test");
    }
    return account;
  }

  const session = await getAppSession();

  if (!session?.user?.accountId) {
    redirect("/account/login");
  }

  activateRequestDataScope({ dataScope: session.user.dataScope ?? "PRODUCTION" });

  const account = await prisma.account.findUnique({
    where: { id: session.user.accountId },
    include: {
      applicantProfile: true,
      juryProfile: true,
    },
  });

  if (!account || account.status === "DISABLED") {
    redirect("/account/login");
  }

  return account;
}

export async function requireApplicantAccount() {
  const account = await requireAccount();
  if (account.role !== "APPLICANT") {
    redirect(getDashboardPathForRole(account.role));
  }

  // An incomplete account migration used to redirect this route back to itself,
  // leaving the applicant dashboard permanently loading in the browser.
  if (!account.applicantProfile) {
    redirect("/account/profile-unavailable");
  }

  return { account, applicantProfile: account.applicantProfile };
}

export async function requireJuryAccount() {
  const account = await requireAccount();
  if (account.role !== "JURY" || !account.juryProfile) {
    redirect(getDashboardPathForRole(account.role));
  }
  return { account, juryProfile: account.juryProfile };
}
