"use server";

import { createAccountSetupToken } from "@/features/account/server/tokens";
import { sendAccountSetupEmail } from "@/features/account/server/emails";
import { normalizeAccountEmail } from "@/features/account/server/password";
import { prisma } from "@/shared/lib/prisma";

export type ResendRegistrationState = {
  sent?: boolean;
  error?: string;
};

const RESEND_COOLDOWN_MS = 10 * 60 * 1000;

export async function resendRegistrationLinkAction(
  _prev: ResendRegistrationState | undefined,
  formData: FormData
): Promise<ResendRegistrationState> {
  const email = normalizeAccountEmail(String(formData.get("registrationEmail") ?? ""));

  if (!email) {
    return { error: "Email is required." };
  }

  const payload = await prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { email },
      include: { applicantProfile: { select: { fullName: true } } },
    });

    if (
      !account ||
      account.role !== "APPLICANT" ||
      account.status === "DISABLED" ||
      account.passwordHash ||
      !account.applicantProfile
    ) {
      return null;
    }

    if (
      account.lastSetupEmailSentAt &&
      Date.now() - account.lastSetupEmailSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return null;
    }

    const token = await createAccountSetupToken(tx, {
      accountId: account.id,
      purpose: "SETUP",
    });

    return {
      accountId: account.id,
      email: account.email,
      fullName: account.applicantProfile.fullName,
      token: token.token,
    };
  });

  if (payload) {
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
  }

  return { sent: true };
}
