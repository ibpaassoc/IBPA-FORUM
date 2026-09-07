import "server-only";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { ScoringHttpError } from "@/features/jury/server/scoring-shared";
import {
  parseScoringState,
  SCORING_STATE_KEY,
  SCORING_WRITE_LOCK_KEY,
  type ScoringState,
} from "@/features/jury/scoring/scoring-state";

export type { ScoringState } from "@/features/jury/scoring/scoring-state";

export async function getScoringState() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: SCORING_STATE_KEY },
    select: { value: true },
  });
  return parseScoringState(setting?.value);
}

export async function lockScoringState(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${SCORING_WRITE_LOCK_KEY}))`;
}

export async function assertScoringOpen(tx: Prisma.TransactionClient) {
  await lockScoringState(tx);
  const setting = await tx.siteSetting.findUnique({
    where: { key: SCORING_STATE_KEY },
    select: { value: true },
  });
  const state = parseScoringState(setting?.value);
  if (state.status === "CLOSED") {
    throw new ScoringHttpError(409, "Scoring is closed. Reviews are now read-only.");
  }
}

export async function closeScoring() {
  const result = await prisma.$transaction(async (tx) => {
    await lockScoringState(tx);
    const existing = await tx.siteSetting.findUnique({
      where: { key: SCORING_STATE_KEY },
      select: { value: true },
    });
    const current = parseScoringState(existing?.value);

    if (current.status === "CLOSED") {
      return { changed: false, state: current };
    }

    const closedAt = new Date();
    const value = {
      schemaVersion: 1,
      status: "CLOSED",
      closedAt: closedAt.toISOString(),
    } satisfies Prisma.InputJsonObject;

    await tx.siteSetting.upsert({
      where: { key: SCORING_STATE_KEY },
      create: { key: SCORING_STATE_KEY, value },
      update: { value },
    });

    return {
      changed: true,
      state: { status: "CLOSED", closedAt } satisfies ScoringState,
    };
  });

  revalidatePath("/admin/scoring");
  revalidatePath("/account/jury");
  revalidatePath("/account/jury/nominations");

  return result;
}
