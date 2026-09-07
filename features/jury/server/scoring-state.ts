import "server-only";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { ScoringHttpError } from "@/features/jury/server/scoring-shared";
import {
  isScoringOpenForJury,
  parseScoringState,
  resolveJuryScoringState,
  SCORING_STATE_KEY,
  SCORING_WRITE_LOCK_KEY,
  type ScoringState,
} from "@/features/jury/scoring/scoring-state";

export type { JuryScoringState, ScoringState } from "@/features/jury/scoring/scoring-state";

function revalidateScoringPaths() {
  revalidatePath("/admin/scoring");
  revalidatePath("/account/jury");
  revalidatePath("/account/jury/nominations");
}

export async function getScoringState() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: SCORING_STATE_KEY },
    select: { value: true },
  });
  return parseScoringState(setting?.value);
}

/** Состояние оценивания с учётом ручного доступа конкретного члена жюри. */
export async function getScoringStateForJury(juryProfileId: string) {
  return resolveJuryScoringState(await getScoringState(), juryProfileId);
}

export async function lockScoringState(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${SCORING_WRITE_LOCK_KEY}))`;
}

async function readScoringState(tx: Prisma.TransactionClient) {
  const setting = await tx.siteSetting.findUnique({
    where: { key: SCORING_STATE_KEY },
    select: { value: true },
  });
  return parseScoringState(setting?.value);
}

async function writeScoringState(tx: Prisma.TransactionClient, state: ScoringState) {
  const value = {
    schemaVersion: 1,
    status: state.status,
    closedAt: state.closedAt?.toISOString() ?? null,
    openJuryIds: state.openJuryIds,
  } satisfies Prisma.InputJsonObject;

  await tx.siteSetting.upsert({
    where: { key: SCORING_STATE_KEY },
    create: { key: SCORING_STATE_KEY, value },
    update: { value },
  });
}

export async function assertScoringOpen(
  tx: Prisma.TransactionClient,
  juryProfileId?: string
) {
  await lockScoringState(tx);
  const state = await readScoringState(tx);
  if (state.status === "CLOSED" && !(juryProfileId && isScoringOpenForJury(state, juryProfileId))) {
    throw new ScoringHttpError(409, "Scoring is closed. Reviews are now read-only.");
  }
}

export async function closeScoring() {
  const result = await prisma.$transaction(async (tx) => {
    await lockScoringState(tx);
    const current = await readScoringState(tx);

    if (current.status === "CLOSED") {
      return { changed: false, state: current };
    }

    const state = {
      status: "CLOSED",
      closedAt: new Date(),
      openJuryIds: [],
    } satisfies ScoringState;
    await writeScoringState(tx, state);

    return { changed: true, state };
  });

  revalidateScoringPaths();

  return result;
}

/**
 * Ручное открытие или закрытие оценивания для одного члена жюри после
 * глобального закрытия. Отправленные оценки не меняются.
 */
export async function setJuryScoringAccess({
  juryProfileId,
  open,
}: {
  juryProfileId: string;
  open: boolean;
}) {
  const result = await prisma.$transaction(async (tx) => {
    await lockScoringState(tx);
    const current = await readScoringState(tx);

    if (current.status === "OPEN") {
      throw new ScoringHttpError(409, "Scoring is open for every judge already.");
    }

    const jury = await tx.juryProfile.findUnique({
      where: { id: juryProfileId },
      select: { id: true },
    });
    if (!jury) {
      throw new ScoringHttpError(404, "Jury profile not found.");
    }

    const alreadyOpen = current.openJuryIds.includes(juryProfileId);
    if (alreadyOpen === open) {
      return { changed: false, state: current };
    }

    const openJuryIds = open
      ? [...current.openJuryIds, juryProfileId].sort()
      : current.openJuryIds.filter((id) => id !== juryProfileId);
    const state = { ...current, openJuryIds } satisfies ScoringState;
    await writeScoringState(tx, state);

    return { changed: true, state };
  });

  revalidateScoringPaths();
  revalidatePath("/account/jury/completed");

  return result;
}
