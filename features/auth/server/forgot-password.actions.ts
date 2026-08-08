"use server";

import { prisma } from "@/shared/lib/prisma";
import { normalizeAccountEmail } from "@/features/account/server/password";
import { findAccountForPublicAuth } from "@/features/account/server/accounts";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { createPasswordResetToken } from "@/features/account/server/tokens";
import { sendAccountPasswordResetEmail } from "@/features/account/server/emails";
import { parsePublicAccountRole, toAccountRole } from "@/features/auth/lib/role";

export type ForgotPasswordState = {
  sent?: boolean;
  error?: string;
};

export async function forgotPasswordAction(
  _prev: ForgotPasswordState | undefined,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = normalizeAccountEmail(String(formData.get("email") ?? ""));
  const role = parsePublicAccountRole(String(formData.get("role") ?? ""));

  if (!email) {
    return { error: "Email is required." };
  }

  const account = await findAccountForPublicAuth(email, toAccountRole(role));

  // Always return success to prevent email enumeration attacks.
  if (!account || account.status === "DISABLED") {
    return { sent: true };
  }

  activateRequestDataScope({ dataScope: account.dataScope });

  const token = await createPasswordResetToken(account.id);
  const result = await sendAccountPasswordResetEmail({ to: account.email, token: token.token });

  if (!result.delivered) {
    const error = result.error ?? result.reason ?? "Password reset email delivery failed.";
    await Promise.all([
      prisma.account.updateMany({
        where: { id: account.id, setupTokenHash: token.tokenHash },
        data: { setupTokenUsedAt: new Date() },
      }),
      prisma.account.update({
        where: { id: account.id },
        data: {
          lastSetupEmailDeliveryStatus: result.reason ?? "failed",
          lastSetupEmailDeliveryError: error,
        },
      }),
    ]);
    console.error("Failed to send password reset email", {
      accountId: account.id,
      email: account.email,
      reason: result.reason,
      error,
    });
    return { sent: true };
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      lastSetupEmailSentAt: new Date(),
      lastSetupEmailDeliveryStatus: "delivered",
      lastSetupEmailDeliveryError: null,
    },
  });

  return { sent: true };
}
