import "server-only";
import { getSheetsClient, type SheetsClient } from "./client";
import { SHEET_TABS } from "./config";
import {
  APPLICATIONS_SHEET,
  JURY_SHEET,
  SCORES_SHEET,
  TICKETS_SHEET,
} from "./schema";
import { ensureSheetFormatting, upsertSheetRows } from "./sheet-ops";
import {
  fetchAllApplicationRows,
  fetchAllJuryRows,
  fetchAllScoreRows,
  fetchAllTicketRows,
  fetchApplicationRow,
  fetchJuryRow,
  fetchScoreRow,
  fetchTicketRow,
} from "./rows";
import { computeStatsRows } from "./stats";

/**
 * High-level sync operations. Each function performs an idempotent upsert into
 * the relevant tab, so running any of them once or many times yields the same
 * result with no duplicate rows. These are the entry points used both by the
 * automatic hooks and the admin backfill tools.
 */

// ── Per-record syncs ─────────────────────────────────────────────────────────

export async function syncApplicationToSheet(id: string): Promise<void> {
  const row = await fetchApplicationRow(id);
  if (!row) return;
  await upsertSheetRows(getSheetsClient(), APPLICATIONS_SHEET, [row]);
}

export async function syncJuryToSheet(id: string): Promise<void> {
  const row = await fetchJuryRow(id);
  if (!row) return;
  await upsertSheetRows(getSheetsClient(), JURY_SHEET, [row]);
}

export async function syncScoreToSheet(id: string): Promise<void> {
  const row = await fetchScoreRow(id);
  if (!row) return;
  await upsertSheetRows(getSheetsClient(), SCORES_SHEET, [row]);
}

export async function syncTicketToSheet(id: string): Promise<void> {
  const row = await fetchTicketRow(id);
  if (!row) return;
  await upsertSheetRows(getSheetsClient(), TICKETS_SHEET, [row]);
}

// ── Statistics ───────────────────────────────────────────────────────────────

let statsEnsured = false;

async function ensureStatsSheet(client: SheetsClient): Promise<void> {
  if (statsEnsured) return;
  // ensureSheetFormatting also creates the tab when it is missing.
  await ensureSheetFormatting(client, SHEET_TABS.stats, 2);
  statsEnsured = true;
}

export async function syncStatsToSheet(): Promise<void> {
  const client = getSheetsClient();
  const rows = await computeStatsRows();

  await ensureStatsSheet(client);
  // Clear first so removed metrics never leave stale trailing rows behind.
  await client.clearValues(`${SHEET_TABS.stats}!A:B`);
  await client.updateValues(`${SHEET_TABS.stats}!A1`, rows);
}

// ── Bulk backfill ────────────────────────────────────────────────────────────

export type SyncAllResult = {
  applications: number;
  jury: number;
  scores: number;
  tickets: number;
  statsUpdated: boolean;
  errors: string[];
};

async function backfill(
  label: string,
  errors: string[],
  run: () => Promise<number>
): Promise<number> {
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Google Sheets backfill failed for ${label}`, error);
    errors.push(`${label}: ${message}`);
    return 0;
  }
}

export async function syncAllApplications(): Promise<number> {
  const rows = await fetchAllApplicationRows();
  await upsertSheetRows(getSheetsClient(), APPLICATIONS_SHEET, rows);
  return rows.length;
}

export async function syncAllJury(): Promise<number> {
  const rows = await fetchAllJuryRows();
  await upsertSheetRows(getSheetsClient(), JURY_SHEET, rows);
  return rows.length;
}

export async function syncAllScores(): Promise<number> {
  const rows = await fetchAllScoreRows();
  await upsertSheetRows(getSheetsClient(), SCORES_SHEET, rows);
  return rows.length;
}

export async function syncAllTickets(): Promise<number> {
  const rows = await fetchAllTicketRows();
  await upsertSheetRows(getSheetsClient(), TICKETS_SHEET, rows);
  return rows.length;
}

/**
 * Export every existing record into the spreadsheet using upserts, then refresh
 * the statistics tab. Safe to run repeatedly. Each domain is isolated so a
 * failure in one does not prevent the others from syncing; failures are
 * collected and returned rather than thrown.
 */
export async function syncAllToSheets(): Promise<SyncAllResult> {
  const errors: string[] = [];

  const applications = await backfill("applications", errors, syncAllApplications);
  const jury = await backfill("jury", errors, syncAllJury);
  const scores = await backfill("scores", errors, syncAllScores);
  const tickets = await backfill("tickets", errors, syncAllTickets);

  let statsUpdated = false;
  try {
    await syncStatsToSheet();
    statsUpdated = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Google Sheets stats refresh failed", error);
    errors.push(`statistics: ${message}`);
  }

  return { applications, jury, scores, tickets, statsUpdated, errors };
}
