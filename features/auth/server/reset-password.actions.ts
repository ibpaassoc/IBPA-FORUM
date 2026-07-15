"use server";

import { prisma } from "@/shared/lib/prisma";
import { createPasswordHash, isStrongPassword } from "@/features/account/server/password";
import { validateAccountToken } from "@/features/account/server/tokens";

export type ResetPasswordState = {
  success?: boolean;
  invalidToken?: boolean;
  expiredToken?: boolean;
  error?: string;
};

export async function resetPasswordAction(
  _prev: ResetPasswordState | undefined,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const validation = await validateAccountToken({ token, purpose: "PASSWORD_RESET" });

  if (!validation.valid) {
    return validation.expired ? { expiredToken: true } : { invalidToken: true };
  }

  if (!isStrongPassword(password)) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const passwordHash = await createPasswordHash(password);

  await prisma.$transaction([
    prisma.account.update({
      where: { id: validation.record.accountId },
      data: {
        passwordHash,
        status: "ACTIVE",
      },
    }),
    prisma.accountSetupToken.update({
      where: { id: validation.record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
