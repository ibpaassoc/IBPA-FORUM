import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { AccountSetupTokenPurpose, Prisma } from "@prisma/client";
import { prisma, unscopedPrisma } from "@/shared/lib/prisma";
import { activateRequestDataScope } from "@/features/test/server/data-scope";

export const SETUP_TOKEN_TTL_MS = 3 * 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashAccountToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAccountSetupToken(
  tx: Prisma.TransactionClient,
  {
    accountId,
    purpose = "SETUP",
    ttlMs = purpose === "SETUP" ? SETUP_TOKEN_TTL_MS : PASSWORD_RESET_TOKEN_TTL_MS,
  }: {
    accountId: string;
    purpose?: AccountSetupTokenPurpose;
    ttlMs?: number;
  }
) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashAccountToken(token);
  const expiresAt = new Date(Date.now() + ttlMs);
  await tx.account.update({
    where: { id: accountId },
    data: {
      setupTokenHash: tokenHash,
      setupTokenPurpose: purpose,
      setupTokenExpiresAt: expiresAt,
      setupTokenIssuedAt: new Date(),
      setupTokenUsedAt: null,
    },
  });

  return { token, tokenHash, expiresAt };
}

export async function createPasswordResetToken(accountId: string) {
  return prisma.$transaction((tx) =>
    createAccountSetupToken(tx, {
      accountId,
      purpose: "PASSWORD_RESET",
      ttlMs: PASSWORD_RESET_TOKEN_TTL_MS,
    }),
  );
}

type ValidAccountTokenRecord = {
  id: string;
  accountId: string;
  account: {
    id: string;
    email: string;
    role: "APPLICANT" | "JURY";
  };
};

export async function validateAccountToken({
  token,
  purpose,
}: {
  token: string;
  purpose: AccountSetupTokenPurpose;
}) {
  const tokenHash = hashAccountToken(token);

  const account = await unscopedPrisma.account.findUnique({
    where: { setupTokenHash: tokenHash },
    select: {
      id: true,
      email: true,
      role: true,
      dataScope: true,
      setupTokenPurpose: true,
      setupTokenExpiresAt: true,
      setupTokenUsedAt: true,
    },
  });

  if (!account || account.setupTokenPurpose !== purpose || account.setupTokenUsedAt) {
    return { valid: false as const };
  }

  if (!account.setupTokenExpiresAt || account.setupTokenExpiresAt < new Date()) {
    return { valid: false as const, expired: true as const };
  }

  activateRequestDataScope({ dataScope: account.dataScope });

  return {
    valid: true as const,
    record: {
      id: account.id,
      accountId: account.id,
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
      },
    } satisfies ValidAccountTokenRecord,
  };
}
