import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { AccountSetupTokenPurpose, Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";

const DEFAULT_TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashAccountToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAccountSetupToken(
  tx: Prisma.TransactionClient,
  {
    accountId,
    purpose = "SETUP",
    ttlMs = DEFAULT_TOKEN_TTL_MS,
  }: {
    accountId: string;
    purpose?: AccountSetupTokenPurpose;
    ttlMs?: number;
  }
) {
  await tx.accountSetupToken.updateMany({
    where: {
      accountId,
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashAccountToken(token);
  const expiresAt = new Date(Date.now() + ttlMs);

  await tx.accountSetupToken.create({
    data: {
      accountId,
      purpose,
      tokenHash,
      expiresAt,
    },
  });

  return { token, tokenHash, expiresAt };
}

export async function validateAccountToken({
  token,
  purpose,
}: {
  token: string;
  purpose: AccountSetupTokenPurpose;
}) {
  const tokenHash = hashAccountToken(token);
  const record = await prisma.accountSetupToken.findUnique({
    where: { tokenHash },
    include: { account: true },
  });

  if (!record || record.purpose !== purpose || record.usedAt) {
    return { valid: false as const };
  }

  if (record.expiresAt < new Date()) {
    return { valid: false as const, expired: true as const };
  }

  return { valid: true as const, record };
}
