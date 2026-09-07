import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildOfficialAwardRanks } from "@/features/admin/lib/scoring-ranking";
import {
  getAverageOfficialScore,
  getSubmittedReviewCount,
  isSubmittedReviewStatus,
} from "@/features/jury/scoring/review-status";
import {
  isScoringOpenForJury,
  parseScoringState,
  resolveJuryScoringState,
} from "@/features/jury/scoring/scoring-state";

function testSubmittedOnlyCalculations() {
  const reviews = [
    { status: "SUBMITTED", totalScore: 92 },
    { status: "IN_PROGRESS", totalScore: 100 },
    { status: "NOT_STARTED", totalScore: null },
    { status: "COMPLETED", totalScore: 99 },
    { status: "LOCKED", totalScore: 98 },
  ];
  assert.equal(isSubmittedReviewStatus("SUBMITTED"), true);
  assert.equal(isSubmittedReviewStatus("COMPLETED"), false);
  assert.equal(getSubmittedReviewCount(reviews), 1);
  assert.equal(getAverageOfficialScore(reviews), 92);
}

function testOfficialRanks() {
  const ranks = buildOfficialAwardRanks([
    { id: "a", awardId: "award-x", averageScore: 92.4 },
    { id: "b", awardId: "award-x", averageScore: 90.8 },
    { id: "c", awardId: "award-x", averageScore: null },
    { id: "d", awardId: "award-y", averageScore: 75 },
    { id: "e", awardId: "award-y", averageScore: 75 },
  ]);
  assert.equal(ranks.get("a"), 1);
  assert.equal(ranks.get("b"), 2);
  assert.equal(ranks.has("c"), false);
  assert.equal(ranks.get("d"), 1);
  assert.equal(ranks.get("e"), 1);
}

function testScoringStateParsing() {
  assert.deepEqual(parseScoringState(undefined), { status: "OPEN", closedAt: null, openJuryIds: [] });
  const closed = parseScoringState({ status: "CLOSED", closedAt: "2026-09-07T12:00:00.000Z" });
  assert.equal(closed.status, "CLOSED");
  assert.equal(closed.closedAt?.toISOString(), "2026-09-07T12:00:00.000Z");
  assert.deepEqual(closed.openJuryIds, []);
  // Ручные исключения читаются только у закрытого оценивания и нормализуются.
  assert.deepEqual(
    parseScoringState({ status: "CLOSED", openJuryIds: ["b", "a", "a", "", 7, " c "] }).openJuryIds,
    ["a", "b", "c"]
  );
  assert.deepEqual(parseScoringState({ status: "OPEN", openJuryIds: ["a"] }).openJuryIds, []);
}

function testManualJuryAccess() {
  const open = parseScoringState(undefined);
  const closed = parseScoringState({ status: "CLOSED", closedAt: "2026-09-07T12:00:00.000Z", openJuryIds: ["jury-1"] });

  assert.equal(isScoringOpenForJury(open, "jury-9"), true);
  assert.equal(isScoringOpenForJury(closed, "jury-1"), true);
  assert.equal(isScoringOpenForJury(closed, "jury-2"), false);

  // Открытое глобально оценивание не считается ручным исключением.
  assert.deepEqual(resolveJuryScoringState(open, "jury-1"), { ...open, manuallyOpened: false });
  const resolvedOpen = resolveJuryScoringState(closed, "jury-1");
  assert.equal(resolvedOpen.status, "OPEN");
  assert.equal(resolvedOpen.manuallyOpened, true);
  assert.equal(resolvedOpen.closedAt?.toISOString(), "2026-09-07T12:00:00.000Z");
  const resolvedClosed = resolveJuryScoringState(closed, "jury-2");
  assert.equal(resolvedClosed.status, "CLOSED");
  assert.equal(resolvedClosed.manuallyOpened, false);
}

async function testWriteBarrierAndMigration() {
  const [stateSource, reviewSource, adminSource, migration] = await Promise.all([
    readFile("features/jury/server/scoring-state.ts", "utf8"),
    readFile("features/jury/server/reviews.ts", "utf8"),
    readFile("features/admin/server/admin.ts", "utf8"),
    readFile("prisma/migrations/20260907120500_backfill_submitted_jury_reviews/migration.sql", "utf8"),
  ]);
  assert.match(stateSource, /pg_advisory_xact_lock/);
  assert.match(stateSource, /changed: false/);
  assert.doesNotMatch(stateSource, /juryNominationReview\.(update|updateMany|delete)/);
  // Ручной доступ выдаётся только при закрытом оценивании и под тем же локом.
  assert.match(stateSource, /setJuryScoringAccess/);
  assert.match(stateSource, /Scoring is open for every judge already/);
  assert.equal((reviewSource.match(/assertScoringOpen\(tx, judge\.juryProfileId\)/g) ?? []).length, 2);
  assert.doesNotMatch(reviewSource, /assertScoringOpen\(tx\)/);
  assert.match(adminSource, /assertScoringOpen\(tx, existingReview\.juryProfileId\)/);
  assert.match(reviewSource, /status: "SUBMITTED" as const/);
  assert.match(migration, /"submittedAt" IS NOT NULL/);
  assert.doesNotMatch(migration, /SET "submittedAt"/);
}

async function main() {
  testSubmittedOnlyCalculations();
  testOfficialRanks();
  testScoringStateParsing();
  testManualJuryAccess();
  await testWriteBarrierAndMigration();
  console.log("Scoring management tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
