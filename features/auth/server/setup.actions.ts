"use server";

import { prisma } from "@/shared/lib/prisma";
import { createPasswordHash, isStrongPassword } from "@/features/account/server/password";
import { validateAccountToken } from "@/features/account/server/tokens";

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

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: validation.record.accountId },
      data: {
        passwordHash,
        status: "ACTIVE",
        setupTokenHash: null,
        setupTokenExpiresAt: null,
        setupTokenIssuedAt: null,
        setupTokenUsedAt: new Date(),
      },
    });

    if (validation.record.source === "table") {
      await tx.accountSetupToken.update({
        where: { id: validation.record.id },
        data: { usedAt: new Date() },
      });
    }
  });

  return {
    success: true,
    email: validation.record.account.email,
  };
}
