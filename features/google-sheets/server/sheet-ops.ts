import "server-only";
import type { SheetsClient, SheetValues } from "./client";
import type { SheetDefinition } from "./schema";

/**
 * Reusable sheet primitives: make sure a tab exists with correct headers and
 * clean formatting, then upsert rows by their unique ID. These power both the
 * per-record syncs and the full backfill, so there is a single implementation
 * of "create header if missing / update existing / append new".
 */

const HEADER_BACKGROUND = { red: 0.12, green: 0.16, blue: 0.18 };
const HEADER_TEXT_COLOR = { red: 1, green: 1, blue: 1 };

// Per-process memo so we only pay the ensure cost on the first sync after a cold
// start. Keyed by spreadsheetId + tab so it stays correct if config changes.
const ensuredTabs = new Set<string>();

function memoKey(client: SheetsClient, tab: string): string {
  return `${client.spreadsheetId}:${tab}`;
}

/** Reset the ensure-memo. Forces headers/formatting to be re-applied. */
export function resetEnsureCache(): void {
  ensuredTabs.clear();
}

async function getSheetId(client: SheetsClient, title: string): Promise<number> {
  const properties = await client.getSheetProperties();
  let match = properties.find((sheet) => sheet.title === title);

  if (!match) {
    await client.batchUpdate([{ addSheet: { properties: { title } } }]);
    const refreshed = await client.getSheetProperties();
    match = refreshed.find((sheet) => sheet.title === title);
  }

  if (!match) {
    throw new Error(`Unable to create or locate sheet tab "${title}".`);
  }

  return match.sheetId;
}

function headersMatch(existing: SheetValues, headers: string[]): boolean {
  const firstRow = existing[0] ?? [];
  if (firstRow.length < headers.length) return false;
  return headers.every((header, index) => firstRow[index] === header);
}

/**
 * Apply the standard formatting to a tab: frozen + bold header row and
 * auto-sized columns. Safe to call repeatedly (idempotent on Google's side).
 */
export async function ensureSheetFormatting(
  client: SheetsClient,
  tab: string,
  columnCount: number
): Promise<void> {
  const sheetId = await getSheetId(client, tab);

  await client.batchUpdate([
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: HEADER_BACKGROUND,
            verticalAlignment: "MIDDLE",
            textFormat: {
              bold: true,
              foregroundColor: HEADER_TEXT_COLOR,
            },
          },
        },
        fields:
          "userEnteredFormat(backgroundColor,verticalAlignment,textFormat)",
      },
    },
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId,
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: Math.max(columnCount, 1),
        },
      },
    },
  ]);
}

/** Write the header row if it is missing or does not match the definition. */
export async function ensureSheetHeaders(
  client: SheetsClient,
  definition: SheetDefinition
): Promise<void> {
  const existing = await client.getValues(`${definition.tab}!1:1`);
  if (!headersMatch(existing, definition.headers)) {
    await client.updateValues(`${definition.tab}!A1`, [definition.headers]);
  }
}

/**
 * Ensure a data tab is ready to receive rows: tab exists, headers present, and
 * formatting applied. Memoized per process to avoid redundant API calls.
 */
export async function ensureDataSheet(
  client: SheetsClient,
  definition: SheetDefinition
): Promise<void> {
  const key = memoKey(client, definition.tab);
  if (ensuredTabs.has(key)) return;

  // getSheetId also creates the tab if it is missing.
  await getSheetId(client, definition.tab);
  await ensureSheetHeaders(client, definition);
  await ensureSheetFormatting(client, definition.tab, definition.headers.length);

  ensuredTabs.add(key);
}

function columnLetter(index: number): string {
  // 0 -> A, 25 -> Z, 26 -> AA …
  let result = "";
  let n = index;
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

/**
 * Upsert rows into a data tab keyed by the first column's unique ID.
 *
 * Reads the ID column once, then updates rows whose ID already exists and
 * appends the rest. Works for a single row (per-record sync) or thousands
 * (backfill), and is fully idempotent — running it again is a no-op for
 * unchanged data and never produces duplicate rows.
 */
export async function upsertSheetRows(
  client: SheetsClient,
  definition: SheetDefinition,
  rows: SheetValues
): Promise<{ updated: number; appended: number }> {
  if (rows.length === 0) {
    return { updated: 0, appended: 0 };
  }

  await ensureDataSheet(client, definition);

  const idColumn = columnLetter(definition.idColumnIndex);
  const lastColumn = columnLetter(definition.headers.length - 1);

  // Map existing IDs to their 1-based sheet row number (header is row 1, so the
  // first data row is row 2).
  const existing = await client.getValues(
    `${definition.tab}!${idColumn}2:${idColumn}`
  );
  const rowByid = new Map<string, number>();
  existing.forEach((cells, index) => {
    const id = cells[0];
    if (id != null && id !== "") {
      rowByid.set(String(id), index + 2);
    }
  });

  const updates: Array<{ range: string; values: SheetValues }> = [];
  const appends: SheetValues = [];

  for (const row of rows) {
    const id = String(row[definition.idColumnIndex] ?? "");
    if (!id) continue;

    const sheetRow = rowByid.get(id);
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
