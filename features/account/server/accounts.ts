import "server-only";

import type { AccountRole, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { getAppSession } from "@/auth";
import { prisma } from "@/shared/lib/prisma";
import { normalizeAccountEmail } from "@/features/account/server/password";
import { createAccountSetupToken } from "@/features/account/server/tokens";
import { sendAccountSetupEmail } from "@/features/account/server/emails";

export class AccountRoleConflictError extends Error {
  constructor(email: string, existingRole: AccountRole, requestedRole: AccountRole) {
    super(`Account ${email} already has role ${existingRole}; cannot assign ${requestedRole}.`);
    this.name = "AccountRoleConflictError";
  }
}

export async function findAccountByEmail(email: string) {
  return prisma.account.findUnique({
    where: { email: normalizeAccountEmail(email) },
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
    where: { email },
    include: { applicantProfile: true },
  });

  if (existing && existing.role !== "APPLICANT") {
    throw new AccountRoleConflictError(email, existing.role, "APPLICANT");
  }

  const account =
    existing ??
    (await tx.account.create({
      data: {
        email,
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
    professionalBio?: string | null;
    professionalWebsite?: string | null;
    status: "SUBMITTED" | "ADDITIONAL_INFO_REQUIRED" | "APPROVED" | "REJECTED" | "PAID";
  }
) {
  const email = normalizeAccountEmail(application.email);
  const existing = await tx.account.findUnique({
    where: { email },
    include: { juryProfile: true },
  });

  if (existing && existing.role !== "JURY") {
    throw new AccountRoleConflictError(email, existing.role, "JURY");
  }

  const account =
    existing ??
    (await tx.account.create({
      data: {
        email,
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
      email: account.email,
      token: token.token,
      fullName: account.applicantProfile?.fullName ?? account.juryProfile?.fullName ?? null,
    };
  });

  if (!payload) {
    return null;
  }

  return sendAccountSetupEmail({
    to: payload.email,
    fullName: payload.fullName,
    token: payload.token,
  });
}

export function getDashboardPathForRole(role: AccountRole) {
  return role === "JURY" ? "/account/jury" : "/account/applicant";
}

export async function requireAccount() {
  const session = await getAppSession();

  if (!session?.user?.accountId) {
    redirect("/account/login");
  }

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
  if (account.role !== "APPLICANT" || !account.applicantProfile) {
    redirect(getDashboardPathForRole(account.role));
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
