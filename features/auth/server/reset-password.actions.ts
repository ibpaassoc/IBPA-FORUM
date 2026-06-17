"use server";

import { prisma } from "@/shared/lib/prisma";
import { createPasswordHash, isStrongPassword } from "@/features/jury/server/auth";

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

  const record = await prisma.juryPasswordReset.findUnique({ where: { token } });

  if (!record || record.usedAt) {
    return { invalidToken: true };
  }

  if (record.expiresAt < new Date()) {
    return { expiredToken: true };
  }

  if (!isStrongPassword(password)) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const passwordHash = await createPasswordHash(password);

  await prisma.juryAccount.update({
    where: { email: record.email },
    data: { passwordHash },
  });

  await prisma.juryPasswordReset.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  return { success: true };
}
