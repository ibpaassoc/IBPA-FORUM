import "server-only";
import { getSheetsClient, type SheetsClient } from "./client";
import { a1, SHEET_TABS } from "./config";
import {
  borderRequests,
  categoryColorRequests,
  columnWidthRequests,
  freezeHeaderRequest,
  statsChartRequests,
  statsResetRequest,
  statsSectionStyleRequest,
  statsTitleStyleRequest,
  statsValueAlignRequest,
} from "./formatting";
import {
  APPLICATIONS_SHEET,
  JURY_SHEET,
  SCORES_SHEET,
  TICKETS_SHEET,
} from "./schema";
import { rebuildDataSheet, resolveSheetMeta, upsertSheetRows } from "./sheet-ops";
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
import { computeStatsLayout, type StatsLayout } from "./stats";

/**
 * High-level sync operations.
 *
 *   • Per-record syncs UPSERT a single row by ID (no duplicates, cleared fields
 *     are blanked) — used by the automatic hooks.
 *   • Full syncs REBUILD the tab into a clean mirror of the database, removing
 *     rows for records that were deleted — used by the admin backfill tools.
 *
 * Both are idempotent: running them once or many times yields the same result.
 */

// ── Per-record syncs ─────────────────────────────────────────────────────────

export async function syncApplicationToSheet(id: string): Promise<void> {
  const record = await fetchApplicationRow(id);
  if (!record) return;
  await upsertSheetRows(getSheetsClient(), APPLICATIONS_SHEET, [record.values]);
}

export async function syncJuryToSheet(id: string): Promise<void> {
  const record = await fetchJuryRow(id);
  if (!record) return;
  await upsertSheetRows(getSheetsClient(), JURY_SHEET, [record.values]);
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

const STATS_COLUMNS = [
  { header: "Показатель", width: 320, wrap: "CLIP" as const },
  { header: "Значение", width: 200, wrap: "CLIP" as const },
];

let statsSheetId: number | null = null;

/** Resolve (creating if needed) the stats tab and apply its static formatting. */
async function ensureStatsSheet(client: SheetsClient): Promise<number> {
  if (statsSheetId != null) return statsSheetId;

  const { sheetId } = await resolveSheetMeta(client, SHEET_TABS.stats);
  statsSheetId = sheetId;

  await client.batchUpdate([
    freezeHeaderRequest(sheetId),
    ...columnWidthRequests(sheetId, STATS_COLUMNS),
  ]);

  return sheetId;
}

export async function syncStatsToSheet(): Promise<void> {
  const client = getSheetsClient();
  const layout = await computeStatsLayout();
  const sheetId = await ensureStatsSheet(client);

  // Clear first so removed metrics never leave stale trailing rows behind.
  await client.clearValues(a1(SHEET_TABS.stats, "A:B"));
  await client.updateValues(a1(SHEET_TABS.stats, "A1"), layout.rows);

  // Colour the category-name labels in the category breakdown sections with the
  // shared palette (same colours as the Applications / Jury category badges).
  const categoryLabelRequests = layout.chartSections.flatMap((section) => {
    const labels = layout.rows
      .slice(section.firstDataRowIndex, section.firstDataRowIndex + section.rowCount)
      .map((row) => String(row[0] ?? ""));
    return categoryColorRequests(sheetId, 0, labels, section.firstDataRowIndex);
  });

  const rowCount = layout.rows.length;
  await client.batchUpdate([
    // Reset a generous block so section colouring from a previous (longer)
    // render can never linger, then re-style the current layout.
    statsResetRequest(sheetId, rowCount + 100),
    // borderRequests treats the arg as "data rows after a header"; passing
    // rowCount - 1 borders exactly rows 1..rowCount.
    ...borderRequests(sheetId, STATS_COLUMNS.length, Math.max(rowCount - 1, 0)),
    statsValueAlignRequest(sheetId, rowCount),
    statsTitleStyleRequest(sheetId, layout.titleRowIndex),
    ...layout.sectionRowIndexes.map((index) =>
      statsSectionStyleRequest(sheetId, index)
    ),
    // Category-name colouring must come last so the reset above can't clear it.
    ...categoryLabelRequests,
  ]);

  // Refresh the breakdown charts in an isolated, best-effort pass so a chart
  // hiccup can never break the numeric dashboard itself.
  await refreshStatsCharts(client, sheetId, layout.chartSections);
}

/** (Re)build the stats breakdown charts idempotently; failures are swallowed. */
async function refreshStatsCharts(
  client: SheetsClient,
  sheetId: number,
  chartSections: StatsLayout["chartSections"]
): Promise<void> {
  try {
    const meta = await client.getSheetMeta();
    const existingChartIds =
      meta.find((sheet) => sheet.sheetId === sheetId)?.chartIds ?? [];
    const requests = statsChartRequests(sheetId, chartSections, existingChartIds);
    if (requests.length > 0) await client.batchUpdate(requests);
  } catch (error) {
    console.error("Google Sheets stats chart refresh failed", error);
  }
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
  const client = getSheetsClient();
  await removeCategoryTabs(client, SHEET_TABS.applications);
  const records = await fetchAllApplicationRows();
  return rebuildDataSheet(client, APPLICATIONS_SHEET, records.map((r) => r.values));
}

export async function syncAllJury(): Promise<number> {
  const client = getSheetsClient();
  await removeCategoryTabs(client, SHEET_TABS.jury);
  const records = await fetchAllJuryRows();
  return rebuildDataSheet(client, JURY_SHEET, records.map((r) => r.values));
}

/**
 * Delete the per-category tabs an earlier layout generated (e.g. "Заявки — Hair",
 * "Жюри — Hair"), leaving only the five base tabs. Best-effort: a cleanup hiccup
 * must never break the data sync. Idempotent — a no-op once the tabs are gone.
 */
async function removeCategoryTabs(client: SheetsClient, baseTab: string): Promise<void> {
  try {
    const meta = await client.getSheetMeta();
    const prefix = `${baseTab} — `;
    const staleIds = meta
      .filter((sheet) => sheet.title.startsWith(prefix))
      .map((sheet) => sheet.sheetId);
    if (staleIds.length === 0) return;
    await client.batchUpdate(staleIds.map((sheetId) => ({ deleteSheet: { sheetId } })));
  } catch (error) {
    console.error(`Google Sheets category-tab cleanup failed for "${baseTab}"`, error);
  }
}

export async function syncAllScores(): Promise<number> {
  const rows = await fetchAllScoreRows();
  return rebuildDataSheet(getSheetsClient(), SCORES_SHEET, rows);
}

export async function syncAllTickets(): Promise<number> {
  const rows = await fetchAllTicketRows();
  return rebuildDataSheet(getSheetsClient(), TICKETS_SHEET, rows);
}

/**
 * Export every existing record into the spreadsheet, rebuilding each tab into a
 * clean mirror of the database, then refresh the statistics tab. Safe to run
 * repeatedly. Each domain is isolated so a failure in one does not prevent the
 * others; failures are collected and returned rather than thrown.
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
