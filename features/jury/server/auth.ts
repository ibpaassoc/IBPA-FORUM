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
          juryApplication: { select: { status: true } },
        },
      },
    },
  });
}

export async function getPaidJuryApplicationByEmail(email: string) {
  const application = await prisma.juryApplication.findFirst({
    where: {
      email: normalizeJuryEmail(email),
      payments: { some: { status: "PAID" } },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      status: true,
      expertiseAreas: true,
      profile: { select: { approvedCategories: true } },
    },
  });
  return application
    ? {
        ...application,
        paymentStatus: "PAID" as const,
        approvedCategories: application.profile?.approvedCategories ?? [],
      }
    : null;
}

export async function getJuryApplicationByEmail(email: string) {
  const application = await prisma.juryApplication.findFirst({
    where: {
      email: normalizeJuryEmail(email),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      status: true,
      expertiseAreas: true,
      payments: { select: { status: true }, orderBy: { createdAt: "desc" }, take: 1 },
      profile: { select: { approvedCategories: true } },
    },
  });
  return application
    ? {
        ...application,
        paymentStatus: application.payments[0]?.status ?? "PENDING",
        approvedCategories: application.profile?.approvedCategories ?? [],
      }
    : null;
}

export async function validatePasswordResetToken(token: string): Promise<{
  valid: boolean;
  expired?: boolean;
}> {
  const result = await validateAccountToken({ token, purpose: "PASSWORD_RESET" });
  return result.valid ? { valid: true } : { valid: false, expired: result.expired };
}

export async function requireJuryAuth() {
  const authenticatedAccount = await requireAccount("JURY");
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
    approvalStatus: profile.juryApplication.status,
    fullName: profile.fullName,
    professionalTitle: profile.professionalTitle ?? "",
    dataScope: authenticatedAccount.dataScope,
  } satisfies JuryAuthUser;
}

export { createPasswordHash, isStrongPassword, verifyPasswordHash };
