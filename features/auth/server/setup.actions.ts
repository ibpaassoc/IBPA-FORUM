"use server";

import { prisma } from "@/shared/lib/prisma";
import { createPasswordHash, isStrongPassword } from "@/features/account/server/password";
import { hashAccountToken, validateAccountToken } from "@/features/account/server/tokens";

export type SetupPasswordState = {
  success?: boolean;
  invalidToken?: boolean;
  expiredToken?: boolean;
  error?: string;
  email?: string;
};

export async function setupPasswordAction(
  _prev: SetupPasswordState | undefined,
  formData: FormData
): Promise<SetupPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const validation = await validateAccountToken({ token, purpose: "SETUP" });

  if (!validation.valid) {
    return validation.expired ? { expiredToken: true } : { invalidToken: true };
  }

  if (!isStrongPassword(password)) {
    return {
      email: validation.record.account.email,
      error: "Password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return {
      email: validation.record.account.email,
      error: "Passwords do not match.",
    };
  }

  const passwordHash = await createPasswordHash(password);

  const now = new Date();
  const tokenHash = hashAccountToken(token);
  const activated = await prisma.$transaction(async (tx) => {
    const consumed = await tx.account.updateMany({
      where: {
        id: validation.record.accountId,
        setupTokenHash: tokenHash,
        setupTokenPurpose: "SETUP",
        setupTokenUsedAt: null,
        setupTokenExpiresAt: { gte: now },
        passwordHash: null,
        status: { not: "DISABLED" },
      },
      data: {
        passwordHash,
        status: "ACTIVE",
        setupTokenHash: null,
        setupTokenPurpose: null,
        setupTokenExpiresAt: null,
        setupTokenIssuedAt: null,
        setupTokenUsedAt: now,
      },
    });
    return consumed.count === 1;
  });

  if (!activated) {
    return { invalidToken: true };
  }

  return {
    success: true,
    email: validation.record.account.email,
  };
}
