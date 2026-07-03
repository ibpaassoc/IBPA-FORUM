import "server-only";
import type { BatchUpdateRequest, SheetsClient, SheetValues } from "./client";
import { a1 } from "./config";
import { sheetHeaders, type SheetDefinition } from "./schema";
import {
  borderRequests,
  categoryColorRequests,
  checkboxValidationRequests,
  clearBordersRequest,
  columnLetter,
  columnWidthRequests,
  conditionalFormatRequests,
  freezeHeaderRequest,
  headerStyleRequest,
  hideColumnsRequests,
  showColumnsRequest,
  slicerRequests,
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
): Promise<{ sheetId: number; conditionalFormatCount: number; slicerIds: number[] }> {
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
    slicerIds: match.slicerIds,
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
  const existing = await client.getValues(a1(definition.tab, "1:1"));
  if (headersMatch(existing, headers)) return;

  // Clear the whole header row first so a previous, wider layout cannot leave
  // stale header labels in the trailing columns.
  await client.clearValues(a1(definition.tab, `A1:${WIDE_CLEAR_LAST_COLUMN}1`));
  await client.updateValues(a1(definition.tab, "A1"), [headers]);
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
    showColumnsRequest(sheetId, columnCount),
    ...hideColumnsRequests(sheetId, definition.hiddenColumnIndexes),
    ...conditionalFormatRequests(
      sheetId,
      columnCount,
      definition.conditionalRules,
      existingConditionalCount
    ),
  ]);
}

/**
 * (Re)build the tab's slicers in their own round trip so a slicer hiccup can
 * never break the data sync. Best-effort: failures are logged and swallowed.
 * The slicer data ranges are open-ended (no end row), so they automatically
 * cover rows appended by later per-record syncs without a rebuild.
 */
async function applySlicers(
  client: SheetsClient,
  definition: SheetDefinition,
  sheetId: number,
  existingSlicerIds: number[]
): Promise<void> {
  if (!definition.slicers?.length) return;
  try {
    await client.batchUpdate(
      slicerRequests(
        sheetId,
        definition.slicers,
        definition.columns.length,
        existingSlicerIds
      )
    );
  } catch (error) {
    console.error(`Google Sheets slicer setup failed for "${definition.tab}"`, error);
  }
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

  const { sheetId, conditionalFormatCount, slicerIds } = await resolveSheetMeta(
    client,
    definition.tab
  );
  sheetIdByTab.set(key, sheetId);

  await ensureSheetHeaders(client, definition);
  await applyStaticFormatting(client, definition, sheetId, conditionalFormatCount);
  await applySlicers(client, definition, sheetId, slicerIds);

  ensuredTabs.add(key);
  return sheetId;
}

// ── Row helpers (category badges + editable checkbox preservation) ───────────

/** Per-row category-badge colouring requests for a contiguous block of rows. */
function categoryFormattingRequests(
  definition: SheetDefinition,
  sheetId: number,
  rows: SheetValues,
  firstRowIndex: number
) {
  const config = definition.category;
  if (!config || rows.length === 0) return [];
  return categoryColorRequests(
    sheetId,
    config.displayColumnIndex,
    rows.map((row) => String(row[config.displayColumnIndex] ?? "")),
    firstRowIndex
  );
}

function isTruthyCell(value: unknown): boolean {
  return value === true || value === "TRUE" || value === "true";
}

/** Read the current checkbox values keyed by record ID (for preservation). */
function extractCheckboxState(
  definition: SheetDefinition,
  existing: SheetValues
): Map<string, boolean[]> {
  const state = new Map<string, boolean[]>();
  const checkboxes = definition.checkboxColumnIndexes;
  if (!checkboxes?.length) return state;

  for (const cells of existing) {
    const id = cells[definition.idColumnIndex];
    if (id == null || id === "") continue;
    state.set(
      String(id),
      checkboxes.map((index) => isTruthyCell(cells[index]))
    );
  }
  return state;
}

/**
 * Extend a mapper row (data + hidden helper flags) with its trailing checkbox
 * values, preserved from the sheet by record ID so admin ticks survive a sync.
 * Rows on tabs without checkbox columns are returned unchanged.
 */
function withCheckboxValues(
  definition: SheetDefinition,
  row: SheetValues[number],
  preserved: Map<string, boolean[]>
): SheetValues[number] {
  const checkboxes = definition.checkboxColumnIndexes;
  if (!checkboxes?.length) return row;
  const id = String(row[definition.idColumnIndex] ?? "");
  const values = preserved.get(id) ?? checkboxes.map(() => false);
  return [...row, ...values];
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
  const hasCheckboxes = Boolean(definition.checkboxColumnIndexes?.length);

  // When a tab has admin-editable checkbox columns we must read the full rows to
  // preserve those ticks by ID; otherwise the ID column alone is enough.
  const existing = await client.getValues(
    a1(definition.tab, hasCheckboxes ? `A2:${lastColumn}` : `${idColumn}2:${idColumn}`)
  );

  // Map existing IDs to their 1-based sheet row number (header is row 1, so the
  // first data row is row 2).
  const rowById = new Map<string, number>();
  existing.forEach((cells, index) => {
    const id = cells[definition.idColumnIndex];
    if (id != null && id !== "") {
      rowById.set(String(id), index + 2);
    }
  });
  const preserved = extractCheckboxState(definition, existing);

  const priorDataRows = rowById.size;
  const updates: Array<{ range: string; values: SheetValues }> = [];
  const updatedRows: Array<{ sheetRow: number; row: SheetValues[number] }> = [];
  const appends: SheetValues = [];

  for (const row of rows) {
    const id = String(row[definition.idColumnIndex] ?? "");
    if (!id) continue;

    const fullRow = withCheckboxValues(definition, row, preserved);
    const sheetRow = rowById.get(id);
    if (sheetRow) {
      updates.push({
        range: a1(definition.tab, `A${sheetRow}:${lastColumn}${sheetRow}`),
        values: [fullRow],
      });
      updatedRows.push({ sheetRow, row: fullRow });
    } else {
      appends.push(fullRow);
    }
  }

  if (updates.length > 0) {
    await client.batchUpdateValues(updates);
  }

  if (appends.length > 0) {
    await client.appendValues(a1(definition.tab, "A1"), appends);
  }

  const dataRowCount = priorDataRows + appends.length;
  const categoryRequests = [
    // Updated rows sit at arbitrary positions, so colour each individually…
    ...updatedRows.flatMap(({ sheetRow, row }) =>
      categoryFormattingRequests(definition, sheetId, [row], sheetRow - 1)
    ),
    // …and the appended rows form one contiguous block at the end.
    ...categoryFormattingRequests(definition, sheetId, appends, priorDataRows + 1),
  ];

  await client.batchUpdate([
    ...borderRequests(sheetId, definition.columns.length, dataRowCount),
    ...wrapRequests(sheetId, definition.columns, dataRowCount),
    ...checkboxValidationRequests(
      sheetId,
      definition.checkboxColumnIndexes,
      dataRowCount
    ),
    ...categoryRequests,
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
  const lastColumn = columnLetter(columnCount - 1);
  const hasCheckboxes = Boolean(definition.checkboxColumnIndexes?.length);

  // Read prior rows: the full width when we must preserve editable checkbox
  // ticks by ID (rebuild can reorder rows), otherwise just the ID column.
  const prior = await client.getValues(
    a1(definition.tab, hasCheckboxes ? `A2:${lastColumn}` : "A2:A")
  );
  const priorDataRows = countIds(prior);
  const preserved = extractCheckboxState(definition, prior);

  // Extend each mapper row with its preserved checkbox values so a reorder never
  // detaches an admin tick from its jury member.
  const writeRows = rows.map((row) => withCheckboxValues(definition, row, preserved));

  // Wipe all existing data values across a generous column range.
  await client.clearValues(a1(definition.tab, `A2:${WIDE_CLEAR_LAST_COLUMN}`));

  if (writeRows.length > 0) {
    await client.updateValues(a1(definition.tab, "A2"), writeRows);
  }

  const requests = [
    ...borderRequests(sheetId, columnCount, writeRows.length),
    ...wrapRequests(sheetId, definition.columns, writeRows.length),
    ...checkboxValidationRequests(
      sheetId,
      definition.checkboxColumnIndexes,
      writeRows.length
    ),
    ...categoryFormattingRequests(definition, sheetId, writeRows, 1),
  ];
  if (priorDataRows > writeRows.length) {
    requests.push(
      clearBordersRequest(sheetId, columnCount, writeRows.length, priorDataRows)
    );
  }
  await client.batchUpdate(requests);

  return writeRows.length;
}

/**
 * Rebuild MANY data tabs at once, batching every Sheets call so a fan-out of
 * derived tabs (the per-category tabs) stays fast and well under the API rate
 * limits — one round trip each for: ensure-exists, headers, static formatting,
 * read-for-preservation, clear, write, dynamic formatting. It reuses the exact
 * same request builders as {@link rebuildDataSheet}, so the two never drift.
 *
 * Not memoized (unlike {@link ensureDataSheet}) because it is only used by the
 * full sync, where re-applying headers/formatting once per run is intended.
 * Definitions with slicers are not supported here (category tabs carry none).
 */
export async function rebuildDataSheets(
  client: SheetsClient,
  jobs: Array<{ definition: SheetDefinition; rows: SheetValues }>
): Promise<void> {
  if (jobs.length === 0) return;

  // 1. Ensure every tab exists (create the missing ones in a single batch).
  const meta = await client.getSheetMeta();
  const byTitle = new Map(meta.map((sheet) => [sheet.title, sheet]));

  const missing = jobs.filter((job) => !byTitle.has(job.definition.tab));
  if (missing.length > 0) {
    await client.batchUpdate(
      missing.map((job) => ({ addSheet: { properties: { title: job.definition.tab } } }))
    );
    const refreshed = await client.getSheetMeta();
    refreshed.forEach((sheet) => byTitle.set(sheet.title, sheet));
  }

  const resolved = jobs.map((job) => {
    const sheet = byTitle.get(job.definition.tab);
    if (!sheet) {
      throw new Error(`Unable to create or locate sheet tab "${job.definition.tab}".`);
    }
    // Reset the per-process ensure memo so a later per-record upsert re-applies
    // headers/formatting to this tab rather than trusting a stale cache.
    sheetIdByTab.set(memoKey(client, job.definition.tab), sheet.sheetId);
    ensuredTabs.add(memoKey(client, job.definition.tab));
    return {
      ...job,
      sheetId: sheet.sheetId,
      conditionalFormatCount: sheet.conditionalFormatCount,
    };
  });

  // 2. Headers for every tab in one values write.
  await client.batchUpdateValues(
    resolved.map((job) => ({
      range: a1(job.definition.tab, "A1"),
      values: [sheetHeaders(job.definition)],
    }))
  );

  // 3. Static formatting for every tab in one structural batch.
  await client.batchUpdate(
    resolved.flatMap((job) => {
      const columnCount = job.definition.columns.length;
      return [
        freezeHeaderRequest(job.sheetId),
        headerStyleRequest(job.sheetId, columnCount),
        ...columnWidthRequests(job.sheetId, job.definition.columns),
        showColumnsRequest(job.sheetId, columnCount),
        ...hideColumnsRequests(job.sheetId, job.definition.hiddenColumnIndexes),
        ...conditionalFormatRequests(
          job.sheetId,
          columnCount,
          job.definition.conditionalRules,
          job.conditionalFormatCount
        ),
      ];
    })
  );

  // 4. Read prior rows (ID + any checkbox columns) for all tabs in one call.
  const readRanges = resolved.map((job) => {
    const hasCheckboxes = Boolean(job.definition.checkboxColumnIndexes?.length);
    const lastColumn = columnLetter(job.definition.columns.length - 1);
    return a1(job.definition.tab, hasCheckboxes ? `A2:${lastColumn}` : "A2:A");
  });
  const priorValues = await client.batchGetValues(readRanges);

  // 5. Clear every tab's data range in one call.
  await client.batchClearValues(
    resolved.map((job) => a1(job.definition.tab, `A2:${WIDE_CLEAR_LAST_COLUMN}`))
  );

  // 6. Write every subset (one values write) and collect dynamic formatting.
  const valueWrites: Array<{ range: string; values: SheetValues }> = [];
  const dynamicRequests: BatchUpdateRequest[] = [];

  resolved.forEach((job, index) => {
    const prior = priorValues[index] ?? [];
    const preserved = extractCheckboxState(job.definition, prior);
    const priorDataRows = countIds(prior);
    const writeRows = job.rows.map((row) =>
      withCheckboxValues(job.definition, row, preserved)
    );

    if (writeRows.length > 0) {
      valueWrites.push({ range: a1(job.definition.tab, "A2"), values: writeRows });
    }

    const columnCount = job.definition.columns.length;
    dynamicRequests.push(
      ...borderRequests(job.sheetId, columnCount, writeRows.length),
      ...wrapRequests(job.sheetId, job.definition.columns, writeRows.length),
      ...checkboxValidationRequests(
        job.sheetId,
        job.definition.checkboxColumnIndexes,
        writeRows.length
      ),
      ...categoryFormattingRequests(job.definition, job.sheetId, writeRows, 1)
    );
    if (priorDataRows > writeRows.length) {
      dynamicRequests.push(
        clearBordersRequest(job.sheetId, columnCount, writeRows.length, priorDataRows)
      );
    }
  });

  if (valueWrites.length > 0) await client.batchUpdateValues(valueWrites);
  if (dynamicRequests.length > 0) await client.batchUpdate(dynamicRequests);
}
