import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { AccountSetupTokenPurpose, Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";

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

  if (purpose === "SETUP") {
    await tx.accountSetupToken.updateMany({
      where: {
        accountId,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });

    await tx.account.update({
      where: { id: accountId },
      data: {
        setupTokenHash: tokenHash,
        setupTokenExpiresAt: expiresAt,
        setupTokenIssuedAt: new Date(),
        setupTokenUsedAt: null,
      },
    });

    return { token, tokenHash, expiresAt };
  }

  await tx.accountSetupToken.updateMany({
    where: {
      accountId,
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

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

type ValidAccountTokenRecord = {
  id: string;
  accountId: string;
  source: "account" | "table";
  account: {
    id: string;
    email: string;
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

  if (purpose === "SETUP") {
    const account = await prisma.account.findUnique({
      where: { setupTokenHash: tokenHash },
      select: {
        id: true,
        email: true,
        setupTokenExpiresAt: true,
        setupTokenUsedAt: true,
      },
    });

    if (account) {
      if (account.setupTokenUsedAt) {
        return { valid: false as const };
      }

      if (!account.setupTokenExpiresAt || account.setupTokenExpiresAt < new Date()) {
        return { valid: false as const, expired: true as const };
      }

      return {
        valid: true as const,
        record: {
          id: account.id,
          accountId: account.id,
          source: "account",
          account: {
            id: account.id,
            email: account.email,
          },
        } satisfies ValidAccountTokenRecord,
      };
    }
  }

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

  return {
    valid: true as const,
    record: {
      id: record.id,
      accountId: record.accountId,
      source: "table",
      account: {
        id: record.account.id,
        email: record.account.email,
      },
    } satisfies ValidAccountTokenRecord,
  };
}
