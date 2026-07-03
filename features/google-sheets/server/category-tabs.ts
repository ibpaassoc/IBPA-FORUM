import "server-only";
import { CATEGORIES } from "./categories";
import type { SheetsClient } from "./client";
import type { CategorizedRow } from "./rows";
import type { SheetDefinition } from "./schema";
import { rebuildDataSheet, rebuildDataSheets, upsertSheetRows } from "./sheet-ops";

/**
 * Per-category tab generation.
 *
 * Instead of exposing category slicers on the master Applications / Jury tabs,
 * the workbook carries one auto-generated tab per category (e.g. "Заявки — Hair",
 * "Жюри — Hair"). A record that belongs to several categories appears in each of
 * their tabs, so an admin just opens the tab they care about.
 *
 * Every child tab reuses the master tab's full definition (columns, formatting,
 * category badges, editable checkboxes), so there is a single source of truth —
 * only the tab name changes and the category slicers are dropped.
 */

/** The definition for one of a base tab's per-category child tabs. */
export function categorySheetDefinition(
  base: SheetDefinition,
  categoryLabel: string
): SheetDefinition {
  return {
    ...base,
    tab: `${base.tab} — ${categoryLabel}`,
    // Child tabs are already filtered to a single category, so they carry no
    // slicers — that keeps the workbook clean and the sync fast.
    slicers: undefined,
  };
}

/**
 * Rebuild a domain's master tab plus every per-category tab from the full paid
 * set (a clean mirror that also removes records that are no longer paid/present).
 * Multi-category records are copied into each of their categories' tabs. Returns
 * the master tab's row count.
 */
export async function rebuildDomainWithCategoryTabs(
  client: SheetsClient,
  base: SheetDefinition,
  records: CategorizedRow[]
): Promise<number> {
  // The master tab keeps its own path (it carries slicers); the per-category
  // tabs are rebuilt together in a batched fan-out to stay fast.
  const count = await rebuildDataSheet(
    client,
    base,
    records.map((record) => record.values)
  );

  const jobs = CATEGORIES.map((category) => ({
    definition: categorySheetDefinition(base, category.label),
    rows: records
      .filter((record) => record.categories.includes(category.name))
      .map((record) => record.values),
  }));
  await rebuildDataSheets(client, jobs);

  return count;
}

/**
 * Upsert a single record into its master tab and into the tab of every category
 * it belongs to. Category membership is effectively fixed once a record is paid
 * (there are no refunds), so the periodic full sync is relied on to reconcile the
 * rare case of a record leaving a category.
 */
export async function upsertRecordWithCategoryTabs(
  client: SheetsClient,
  base: SheetDefinition,
  record: CategorizedRow
): Promise<void> {
  await upsertSheetRows(client, base, [record.values]);

  for (const category of CATEGORIES) {
    if (!record.categories.includes(category.name)) continue;
    const definition = categorySheetDefinition(base, category.label);
    await upsertSheetRows(client, definition, [record.values]);
  }
}
