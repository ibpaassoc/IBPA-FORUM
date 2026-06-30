import "server-only";
import type { SheetsClient, SheetValues } from "./client";
import { sheetHeaders, type SheetDefinition } from "./schema";
import {
  borderRequests,
  clearBordersRequest,
  columnLetter,
  columnWidthRequests,
  conditionalFormatRequests,
  freezeHeaderRequest,
  headerStyleRequest,
  wrapRequests,
} from "./formatting";

/**
 * Reusable sheet primitives: make sure a tab exists with correct headers and
 * premium formatting, then upsert rows by their unique ID — or rebuild the tab
 * into a clean mirror of the database. These power both the per-record syncs and
 * the full backfill, so there is a single implementation of "create header if
 * missing / update existing / append new / clear deleted".
 */

// We clear values across a generous column range when rewriting a tab so that
// shrinking the column set (or an older layout) never leaves stale cells behind.
const WIDE_CLEAR_LAST_COLUMN = "AZ";

// Per-process memo so we only pay the ensure cost on the first sync after a cold
// start. Keyed by spreadsheetId + tab so it stays correct if config changes.
const ensuredTabs = new Set<string>();
// Cache the numeric sheetId per tab so border/formatting calls need no extra
// round trip once a tab has been ensured.
const sheetIdByTab = new Map<string, number>();

function memoKey(client: SheetsClient, tab: string): string {
  return `${client.spreadsheetId}:${tab}`;
}

/** Reset the ensure-memo. Forces headers/formatting to be re-applied. */
export function resetEnsureCache(): void {
  ensuredTabs.clear();
  sheetIdByTab.clear();
}

function isAlreadyExistsError(error: unknown): boolean {
  return (
    error instanceof Error && /already exists/i.test(error.message)
  );
}

/**
 * Resolve a tab's numeric id and conditional-rule count, creating the tab if it
 * does not exist yet. Creation is tolerant of the "already exists" race so two
 * concurrent syncs can never crash each other.
 */
export async function resolveSheetMeta(
  client: SheetsClient,
  title: string
): Promise<{ sheetId: number; conditionalFormatCount: number }> {
  const meta = await client.getSheetMeta();
  let match = meta.find((sheet) => sheet.title === title);

  if (!match) {
    try {
      await client.batchUpdate([{ addSheet: { properties: { title } } }]);
    } catch (error) {
      // Another sync (or a pre-existing tab) already created it — fall through
      // and re-read rather than failing the whole sync.
      if (!isAlreadyExistsError(error)) throw error;
    }
    const refreshed = await client.getSheetMeta();
    match = refreshed.find((sheet) => sheet.title === title);
  }

  if (!match) {
    throw new Error(`Unable to create or locate sheet tab "${title}".`);
  }

  return {
    sheetId: match.sheetId,
    conditionalFormatCount: match.conditionalFormatCount,
  };
}

function headersMatch(existing: SheetValues, headers: string[]): boolean {
  const firstRow = existing[0] ?? [];
  if (firstRow.length < headers.length) return false;
  return headers.every((header, index) => firstRow[index] === header);
}

/** Write the header row if it is missing or does not match the definition. */
export async function ensureSheetHeaders(
  client: SheetsClient,
  definition: SheetDefinition
): Promise<void> {
  const headers = sheetHeaders(definition);
  const existing = await client.getValues(`${definition.tab}!1:1`);
  if (headersMatch(existing, headers)) return;

  // Clear the whole header row first so a previous, wider layout cannot leave
  // stale header labels in the trailing columns.
  await client.clearValues(`${definition.tab}!A1:${WIDE_CLEAR_LAST_COLUMN}1`);
  await client.updateValues(`${definition.tab}!A1`, [headers]);
}

/**
 * Apply the static (row-count-independent) formatting to a data tab in one round
 * trip: frozen + premium header, fixed column widths, and the status-colour
 * conditional-format rules. (Per-cell wrap is applied per sync — see below —
 * because it does not auto-apply to newly appended rows.)
 */
async function applyStaticFormatting(
  client: SheetsClient,
  definition: SheetDefinition,
  sheetId: number,
  existingConditionalCount: number
): Promise<void> {
  const columnCount = definition.columns.length;

  await client.batchUpdate([
    freezeHeaderRequest(sheetId),
    headerStyleRequest(sheetId, columnCount),
    ...columnWidthRequests(sheetId, definition.columns),
    ...conditionalFormatRequests(
      sheetId,
      columnCount,
      definition.conditionalRules,
      existingConditionalCount
    ),
  ]);
}

/**
 * Ensure a data tab is ready to receive rows: tab exists, headers present, and
 * static formatting applied. Memoized per process to avoid redundant API calls.
 * Returns the tab's numeric sheetId.
 */
export async function ensureDataSheet(
  client: SheetsClient,
  definition: SheetDefinition
): Promise<number> {
  const key = memoKey(client, definition.tab);
  const cached = sheetIdByTab.get(key);
  if (ensuredTabs.has(key) && cached != null) return cached;

  const { sheetId, conditionalFormatCount } = await resolveSheetMeta(
    client,
    definition.tab
  );
  sheetIdByTab.set(key, sheetId);

  await ensureSheetHeaders(client, definition);
  await applyStaticFormatting(client, definition, sheetId, conditionalFormatCount);

  ensuredTabs.add(key);
  return sheetId;
}

function countIds(idCells: SheetValues): number {
  return idCells.filter((cells) => cells[0] != null && cells[0] !== "").length;
}

/**
 * Upsert rows into a data tab keyed by the first column's unique ID.
 *
 * Reads the ID column once, then overwrites the full row of any ID that already
 * exists (so cleared fields are blanked, never left stale) and appends the rest.
 * Works for a single row (per-record sync) or thousands (backfill); fully
 * idempotent and never produces duplicate rows. Borders are re-applied to the
 * populated range so newly appended rows stay inside the grid.
 */
export async function upsertSheetRows(
  client: SheetsClient,
  definition: SheetDefinition,
  rows: SheetValues
): Promise<{ updated: number; appended: number }> {
  if (rows.length === 0) {
    return { updated: 0, appended: 0 };
  }

  const sheetId = await ensureDataSheet(client, definition);

  const idColumn = columnLetter(definition.idColumnIndex);
  const lastColumn = columnLetter(definition.columns.length - 1);

  // Map existing IDs to their 1-based sheet row number (header is row 1, so the
  // first data row is row 2).
  const existing = await client.getValues(
    `${definition.tab}!${idColumn}2:${idColumn}`
  );
  const rowById = new Map<string, number>();
  existing.forEach((cells, index) => {
    const id = cells[0];
    if (id != null && id !== "") {
      rowById.set(String(id), index + 2);
    }
  });

  const priorDataRows = rowById.size;
  const updates: Array<{ range: string; values: SheetValues }> = [];
  const appends: SheetValues = [];

  for (const row of rows) {
    const id = String(row[definition.idColumnIndex] ?? "");
    if (!id) continue;

    const sheetRow = rowById.get(id);
    if (sheetRow) {
      updates.push({
        range: `${definition.tab}!A${sheetRow}:${lastColumn}${sheetRow}`,
        values: [row],
      });
    } else {
      appends.push(row);
    }
  }

  if (updates.length > 0) {
    await client.batchUpdateValues(updates);
  }

  if (appends.length > 0) {
    await client.appendValues(`${definition.tab}!A1`, appends);
  }

  const dataRowCount = priorDataRows + appends.length;
  await client.batchUpdate([
    ...borderRequests(sheetId, definition.columns.length, dataRowCount),
    ...wrapRequests(sheetId, definition.columns, dataRowCount),
  ]);

  return { updated: updates.length, appended: appends.length };
}

/** Convenience wrapper for upserting exactly one row. */
export async function upsertSheetRow(
  client: SheetsClient,
  definition: SheetDefinition,
  row: SheetValues[number]
): Promise<void> {
  await upsertSheetRows(client, definition, [row]);
}

/**
 * Rebuild a data tab so it becomes a clean mirror of the supplied rows: existing
 * data is wiped (including any records deleted from the database or columns from
 * an older layout) and the current rows are written fresh. Borders are drawn for
 * exactly the populated range and cleared from any rows that used to hold data.
 *
 * Used by the full backfill — `upsertSheetRows` remains the path for the
 * incremental per-record hooks.
 */
export async function rebuildDataSheet(
  client: SheetsClient,
  definition: SheetDefinition,
  rows: SheetValues
): Promise<number> {
  const sheetId = await ensureDataSheet(client, definition);
  const columnCount = definition.columns.length;

  const priorIds = await client.getValues(`${definition.tab}!A2:A`);
  const priorDataRows = countIds(priorIds);

  // Wipe all existing data values across a generous column range.
  await client.clearValues(
    `${definition.tab}!A2:${WIDE_CLEAR_LAST_COLUMN}`
  );

  if (rows.length > 0) {
    await client.updateValues(`${definition.tab}!A2`, rows);
  }

  const requests = [
    ...borderRequests(sheetId, columnCount, rows.length),
    ...wrapRequests(sheetId, definition.columns, rows.length),
  ];
  if (priorDataRows > rows.length) {
    requests.push(
      clearBordersRequest(sheetId, columnCount, rows.length, priorDataRows)
    );
  }
  await client.batchUpdate(requests);

  return rows.length;
}
