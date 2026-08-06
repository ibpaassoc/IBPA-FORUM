import "server-only";
import type { DataScope } from "@prisma/client";
import { redirect } from "next/navigation";
import { accountIdentity, requireAccount } from "@/features/account/server/accounts";
import {
  createPasswordHash,
  isStrongPassword,
  normalizeAccountEmail,
  verifyPasswordHash,
} from "@/features/account/server/password";
import { validateAccountToken } from "@/features/account/server/tokens";
import { prisma } from "@/shared/lib/prisma";

export type JuryAuthUser = {
  id: string;
  email: string;
  juryProfileId: string;
  juryApplicationId: string;
  approvedCategories: string[];
  approvalStatus: "SUBMITTED" | "ADDITIONAL_INFO_REQUIRED" | "APPROVED" | "REJECTED" | "PAID" | null;
  fullName: string;
  professionalTitle: string;
  dataScope: DataScope;
};

export function normalizeJuryEmail(email: string) {
  return normalizeAccountEmail(email);
}

export async function findJuryAccountByEmail(email: string) {
  return prisma.account.findUnique({
    where: accountIdentity(email, "JURY"),
    include: {
      juryProfile: {
        select: {
          id: true,
          juryApplicationId: true,
          approvedCategories: true,
          approvalStatus: true,
        },
      },
    },
  });
}

export async function getPaidJuryApplicationByEmail(email: string) {
  return prisma.juryApplication.findUnique({
    where: {
      email: normalizeJuryEmail(email),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      paymentStatus: true,
      status: true,
      expertiseAreas: true,
      approvedCategories: true,
    },
  });
}

export async function getJuryApplicationByEmail(email: string) {
  return prisma.juryApplication.findUnique({
    where: {
      email: normalizeJuryEmail(email),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      paymentStatus: true,
      status: true,
      expertiseAreas: true,
      approvedCategories: true,
    },
  });
}

export async function validatePasswordResetToken(token: string): Promise<{
  valid: boolean;
  expired?: boolean;
}> {
  const result = await validateAccountToken({ token, purpose: "PASSWORD_RESET" });
  return result.valid ? { valid: true } : { valid: false, expired: result.expired };
}

export async function requireJuryAuth() {
  const authenticatedAccount = await requireAccount();
  if (authenticatedAccount.role !== "JURY") {
    redirect("/account/login");
  }

  const profile = authenticatedAccount.juryProfile;
  if (!profile?.juryApplicationId) {
    redirect("/");
  }

  return {
    id: authenticatedAccount.id,
    email: authenticatedAccount.email,
    juryProfileId: profile.id,
    juryApplicationId: profile.juryApplicationId,
    approvedCategories: profile.approvedCategories,
    approvalStatus: profile.approvalStatus,
    fullName: profile.fullName,
    professionalTitle: profile.professionalTitle ?? "",
    dataScope: authenticatedAccount.dataScope,
  } satisfies JuryAuthUser;
}

export { createPasswordHash, isStrongPassword, verifyPasswordHash };
