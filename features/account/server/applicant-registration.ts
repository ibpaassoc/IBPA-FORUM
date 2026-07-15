import "server-only";

import { createAccountSetupToken } from "@/features/account/server/tokens";
import { sendAccountSetupEmail } from "@/features/account/server/emails";
import { normalizeAccountEmail } from "@/features/account/server/password";
import { prisma } from "@/shared/lib/prisma";

export const APPLICANT_REGISTRATION_RESEND_COOLDOWN_MS = 10 * 60 * 1000;
const MIN_REGISTRATION_TOKEN_ISSUE_INTERVAL_MS = 5 * 1000;

export type ApplicantRegistrationLinkResult =
  | { status: "sent"; profileId: string }
  | { status: "ineligible" | "cooldown"; profileId: string | null }
  | { status: "delivery_failed"; profileId: string; error: string };

type RegistrationSelector =
  | { accountId: string; email?: never }
  | { email: string; accountId?: never };

export async function issueApplicantRegistrationLink({
  cooldownMs = 0,
  ...selector
}: RegistrationSelector & { cooldownMs?: number }): Promise<ApplicantRegistrationLinkResult> {
  const normalizedEmail = "email" in selector && selector.email
    ? normalizeAccountEmail(selector.email)
    : null;

  const payload = await prisma.$transaction(async (tx) => {
    const initial = "accountId" in selector
      ? await tx.account.findUnique({ where: { id: selector.accountId }, select: { id: true } })
      : normalizedEmail
        ? await tx.account.findUnique({ where: { email: normalizedEmail }, select: { id: true } })
        : null;

    if (!initial) return null;

    // Serialize token issuance for this account. The short issued-at guard also
    // prevents double-clicks from emailing two links where only the last works.
    await tx.$queryRaw`SELECT "id" FROM "Account" WHERE "id" = ${initial.id} FOR UPDATE`;

    const account = await tx.account.findUnique({
      where: { id: initial.id },
      include: {
        applicantProfile: {
          select: {
            id: true,
            fullName: true,
            deletedAt: true,
            nominations: {
              where: { deletedAt: null, paymentStatus: "PAID" },
              select: { id: true },
              take: 1,
            },
            payments: {
              where: { status: "PAID" },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });

    const hasPaidPurchase = Boolean(
      account?.applicantProfile?.nominations.length || account?.applicantProfile?.payments.length,
    );
    if (
      !account ||
      account.deletedAt ||
      account.role !== "APPLICANT" ||
      account.status === "DISABLED" ||
      account.passwordHash ||
      !account.applicantProfile ||
      account.applicantProfile.deletedAt ||
      !hasPaidPurchase
    ) {
      return null;
    }

    const now = Date.now();
    if (
      account.setupTokenIssuedAt &&
      now - account.setupTokenIssuedAt.getTime() < MIN_REGISTRATION_TOKEN_ISSUE_INTERVAL_MS
    ) {
      return { cooldown: true as const, profileId: account.applicantProfile.id };
    }
    if (
      cooldownMs > 0 &&
      account.lastSetupEmailDeliveryStatus === "delivered" &&
      account.lastSetupEmailSentAt &&
      now - account.lastSetupEmailSentAt.getTime() < cooldownMs
    ) {
      return { cooldown: true as const, profileId: account.applicantProfile.id };
    }

    const token = await createAccountSetupToken(tx, {
      accountId: account.id,
      purpose: "SETUP",
    });

    return {
      cooldown: false as const,
      accountId: account.id,
      profileId: account.applicantProfile.id,
      email: account.email,
      fullName: account.applicantProfile.fullName,
      token: token.token,
      tokenHash: token.tokenHash,
    };
  });

  if (!payload) return { status: "ineligible", profileId: null };
  if (payload.cooldown) return { status: "cooldown", profileId: payload.profileId };

  const result = await sendAccountSetupEmail({
    to: payload.email,
    fullName: payload.fullName,
    token: payload.token,
  });

  if (!result.delivered) {
    const error = result.error ?? result.reason ?? "Email delivery failed.";
    await prisma.account.updateMany({
      where: { id: payload.accountId, setupTokenHash: payload.tokenHash },
      data: {
        setupTokenHash: null,
        setupTokenExpiresAt: null,
        setupTokenUsedAt: new Date(),
        lastSetupEmailDeliveryStatus: result.reason ?? "failed",
        lastSetupEmailDeliveryError: error,
      },
    });
    return { status: "delivery_failed", profileId: payload.profileId, error };
  }

  const finalized = await prisma.account.updateMany({
    where: { id: payload.accountId, setupTokenHash: payload.tokenHash },
    data: {
      lastSetupEmailSentAt: new Date(),
      lastSetupEmailDeliveryStatus: "delivered",
      lastSetupEmailDeliveryError: null,
    },
  });

  if (finalized.count !== 1) {
    return {
      status: "delivery_failed",
      profileId: payload.profileId,
      error: "Registration link was superseded before delivery completed.",
    };
  }

  return { status: "sent", profileId: payload.profileId };
}
