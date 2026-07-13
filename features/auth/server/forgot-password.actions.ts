"use server";

import { prisma } from "@/shared/lib/prisma";
import { normalizeAccountEmail } from "@/features/account/server/password";
import { createAccountSetupToken } from "@/features/account/server/tokens";
import { sendAccountPasswordResetEmail } from "@/features/account/server/emails";

export type ForgotPasswordState = {
  sent?: boolean;
  error?: string;
};

export async function forgotPasswordAction(
  _prev: ForgotPasswordState | undefined,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = normalizeAccountEmail(String(formData.get("email") ?? ""));

  if (!email) {
    return { error: "Email is required." };
  }

  const payload = await prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({ where: { email } });

    // Always return success to prevent email enumeration attacks.
    if (!account || account.status === "DISABLED") {
      return null;
    }

    const token = await createAccountSetupToken(tx, {
      accountId: account.id,
      purpose: "PASSWORD_RESET",
    });

    return { token: token.token, email: account.email };
  });

  if (payload) {
    await sendAccountPasswordResetEmail({ to: payload.email, token: payload.token });
  }

  return { sent: true };
}
