import "server-only";
import { categoryColor, CATEGORY_ORDER } from "./categories";
import type { BatchUpdateRequest } from "./client";

/**
 * Low-level Google Sheets formatting helpers.
 *
 * Everything here returns plain `batchUpdate` request objects so the callers in
 * `sheet-ops` / `sync` can compose them into a single round trip. Keeping the
 * visual language in one place is what makes every tab look consistent: the same
 * premium IBPA header, the same subtle borders, the same soft status colours.
 *
 * Status colours are applied with *conditional formatting* rules (keyed on the
 * status column) rather than by colouring each row by hand. That means new and
 * edited rows are coloured automatically by Google Sheets — there is no per-row
 * formatting work on every sync, and the colours can never drift out of sync
 * with the data.
 */

export type RgbColor = { red: number; green: number; blue: number };
export type WrapStrategy = "WRAP" | "CLIP" | "OVERFLOW_CELL";

/** A single data column: header label, pixel width and text-wrap behaviour. */
export type ColumnSpec = {
  header: string;
  width: number;
  wrap: WrapStrategy;
};

/**
 * A conditional-format rule. By default it colours the whole row when the value
 * in `columnIndex` matches, but it can also match a checkbox being ticked
 * (`matchTrue`), scope the fill to just that column (`columnOnly`), and set a
 * foreground colour (`textColor`) — used to turn ticked checkboxes green.
 */
export type ConditionalRule = {
  columnIndex: number;
  /** Match when the cell text equals this value. */
  equals?: string;
  /** Match when the (checkbox) cell is TRUE. */
  matchTrue?: boolean;
  /** Background colour applied on match. */
  color: RgbColor;
  /** Optional foreground colour applied on match (e.g. green checkmark). */
  textColor?: RgbColor;
  /** Colour only `columnIndex` instead of the whole row. */
  columnOnly?: boolean;
};

/** Soft, readable palette — light backgrounds keep body text legible. */
export const COLORS = {
  headerBg: { red: 0.145, green: 0.165, blue: 0.18 }, // IBPA ink, premium dark
  headerText: { red: 1, green: 1, blue: 1 },
  border: { red: 0.82, green: 0.82, blue: 0.82 }, // subtle but visible
  // Status backgrounds (intentionally pale so the dark body text stays readable)
  green: { red: 0.85, green: 0.93, blue: 0.85 },
  yellow: { red: 0.99, green: 0.96, blue: 0.83 },
  blue: { red: 0.86, green: 0.93, blue: 0.98 },
  red: { red: 0.98, green: 0.87, blue: 0.87 },
  gray: { red: 0.95, green: 0.95, blue: 0.95 },
  // Ticked-checkbox highlight: clearly green background + a strong green
  // checkmark (the tick follows the cell's foreground colour).
  checkboxTrueBg: { red: 0.71, green: 0.88, blue: 0.72 },
  checkboxTrueText: { red: 0.06, green: 0.42, blue: 0.15 },
  // Stats dashboard
  sectionBg: { red: 0.45, green: 0.63, blue: 0.76 }, // medium IBPA blue
  sectionText: { red: 1, green: 1, blue: 1 },
  titleBg: { red: 0.145, green: 0.165, blue: 0.18 },
  titleText: { red: 1, green: 1, blue: 1 },
} as const;

/** Convert a 0-based column index to its A1 letter (0→A, 25→Z, 26→AA…). */
export function columnLetter(index: number): string {
  let result = "";
  let n = index;
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

const SOLID_BORDER = { style: "SOLID", color: COLORS.border } as const;

/** Freeze the first (header) row so it stays visible while scrolling. */
export function freezeHeaderRequest(sheetId: number): BatchUpdateRequest {
  return {
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: "gridProperties.frozenRowCount",
    },
  };
}

/** Bold, dark-on-white header row with the premium IBPA background. */
export function headerStyleRequest(
  sheetId: number,
  columnCount: number
): BatchUpdateRequest {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: columnCount,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.headerBg,
          horizontalAlignment: "LEFT",
          verticalAlignment: "MIDDLE",
          wrapStrategy: "CLIP",
          textFormat: { bold: true, foregroundColor: COLORS.headerText },
        },
      },
      fields:
        "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)",
    },
  };
}

/** Fix each column's width so long text never blows up the layout. */
export function columnWidthRequests(
  sheetId: number,
  columns: ColumnSpec[]
): BatchUpdateRequest[] {
  return columns.map((column, index) => ({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 },
      properties: { pixelSize: column.width },
      fields: "pixelSize",
    },
  }));
}

/**
 * Apply the per-column wrap strategy to the populated data rows (top-aligned).
 * Bounded to `dataRowCount` so newly appended rows are formatted by the same
 * sync that writes them — column widths and conditional colours auto-apply to
 * new rows, but per-cell wrap does not, so we re-apply it on every sync.
 */
export function wrapRequests(
  sheetId: number,
  columns: ColumnSpec[],
  dataRowCount: number
): BatchUpdateRequest[] {
  if (dataRowCount <= 0) return [];
  return columns.map((column, index) => ({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: dataRowCount + 1,
        startColumnIndex: index,
        endColumnIndex: index + 1,
      },
      cell: {
        userEnteredFormat: { wrapStrategy: column.wrap, verticalAlignment: "TOP" },
      },
      fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
    },
  }));
}

/**
 * Replace the tab's conditional-format rules with the supplied status rules.
 * Existing rules are deleted first (by repeatedly removing index 0) so this is
 * fully idempotent across cold starts — colours never accumulate duplicate rules.
 */
export function conditionalFormatRequests(
  sheetId: number,
  columnCount: number,
  rules: ConditionalRule[],
  existingRuleCount: number
): BatchUpdateRequest[] {
  const requests: BatchUpdateRequest[] = [];

  for (let i = 0; i < existingRuleCount; i += 1) {
    requests.push({ deleteConditionalFormatRule: { sheetId, index: 0 } });
  }

  rules.forEach((rule, index) => {
    const letter = columnLetter(rule.columnIndex);
    const formula = rule.matchTrue
      ? `=$${letter}2=TRUE`
      : `=$${letter}2="${rule.equals ?? ""}"`;
    const format: Record<string, unknown> = { backgroundColor: rule.color };
    if (rule.textColor) {
      format.textFormat = { bold: true, foregroundColor: rule.textColor };
    }

    requests.push({
      addConditionalFormatRule: {
        index,
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              startColumnIndex: rule.columnOnly ? rule.columnIndex : 0,
              endColumnIndex: rule.columnOnly ? rule.columnIndex + 1 : columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "CUSTOM_FORMULA",
              values: [{ userEnteredValue: formula }],
            },
            format,
          },
        },
      },
    });
  });

  return requests;
}

/**
 * Draw subtle borders around the populated range (header + `dataRowCount` data
 * rows). Re-applying with the same counts is a no-op, so this is safe to call on
 * every sync.
 */
export function borderRequests(
  sheetId: number,
  columnCount: number,
  dataRowCount: number
): BatchUpdateRequest[] {
  return [
    {
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: dataRowCount + 1,
          startColumnIndex: 0,
          endColumnIndex: columnCount,
        },
        top: SOLID_BORDER,
        bottom: SOLID_BORDER,
        left: SOLID_BORDER,
        right: SOLID_BORDER,
        innerHorizontal: SOLID_BORDER,
        innerVertical: SOLID_BORDER,
      },
    },
  ];
}

/**
 * Clear borders from rows that used to hold data but no longer do (after a full
 * sync removed records). `fromDataRow`/`toDataRow` are 1-based data-row numbers.
 */
export function clearBordersRequest(
  sheetId: number,
  columnCount: number,
  fromDataRow: number,
  toDataRow: number
): BatchUpdateRequest {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: fromDataRow + 1,
        endRowIndex: toDataRow + 1,
        startColumnIndex: 0,
        endColumnIndex: columnCount,
      },
      cell: { userEnteredFormat: { borders: {} } },
      fields: "userEnteredFormat.borders",
    },
  };
}

// ── Hidden helper columns ────────────────────────────────────────────────────

/**
 * Un-hide the tab's current columns. This also migrates tabs from an older
 * layout that hid technical columns exactly where visible columns (e.g. the Jury
 * tracking checkboxes) now live, so nothing stays wrongly hidden after a resync.
 */
export function showColumnsRequest(
  sheetId: number,
  columnCount: number
): BatchUpdateRequest {
  return {
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: columnCount },
      properties: { hiddenByUser: false },
      fields: "hiddenByUser",
    },
  };
}

/** Hide technical helper columns (category flags) from the admin view. */
export function hideColumnsRequests(
  sheetId: number,
  columnIndexes: number[] | undefined
): BatchUpdateRequest[] {
  return (columnIndexes ?? []).map((index) => ({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 },
      properties: { hiddenByUser: true },
      fields: "hiddenByUser",
    },
  }));
}

// ── Editable checkbox columns ────────────────────────────────────────────────

/** Neutral ink used between coloured category badges inside a single cell. */
const CATEGORY_SEPARATOR_COLOR: RgbColor = { red: 0.4, green: 0.4, blue: 0.4 };

/**
 * Turn the admin-editable tracking columns into real checkboxes (boolean data
 * validation) across the populated rows. Re-applying is a harmless no-op, so
 * this runs on every sync to cover newly appended rows.
 */
export function checkboxValidationRequests(
  sheetId: number,
  checkboxColumnIndexes: number[] | undefined,
  dataRowCount: number
): BatchUpdateRequest[] {
  if (!checkboxColumnIndexes?.length || dataRowCount <= 0) return [];
  return checkboxColumnIndexes.map((index) => ({
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: dataRowCount + 1,
        startColumnIndex: index,
        endColumnIndex: index + 1,
      },
      rule: {
        condition: { type: "BOOLEAN" },
        strict: true,
        showCustomUi: true,
      },
    },
  }));
}

// ── Category badges (coloured text runs) ─────────────────────────────────────

/**
 * Build the text-format runs that colour each category name inside one cell like
 * a soft badge: every category gets its consistent colour + bold weight, and the
 * separators between them reset to neutral. Runs are located by matching the
 * canonical category names inside the *actual* cell text, so the value itself is
 * never rewritten — any non-canonical text a row might carry is left untouched.
 */
function categoryTextRuns(text: string): Array<Record<string, unknown>> {
  if (!text) return [];

  const marks = CATEGORY_ORDER.map((category) => ({
    category,
    start: text.indexOf(category),
  }))
    .filter((mark) => mark.start >= 0)
    .sort((a, b) => a.start - b.start);

  const runs: Array<Record<string, unknown>> = [];
  let cursor = -1;
  for (const mark of marks) {
    // Skip anything overlapping an earlier match (none of the category names
    // are substrings of one another, so this only guards against duplicates).
    if (mark.start <= cursor) continue;
    runs.push({
      startIndex: mark.start,
      format: { bold: true, foregroundColor: categoryColor(mark.category) },
    });
    const end = mark.start + mark.category.length;
    // Reset the following separator to neutral, unless the badge ends the cell
    // (a run at the string's end is invalid).
    if (end < text.length) {
      runs.push({
        startIndex: end,
        format: { bold: false, foregroundColor: CATEGORY_SEPARATOR_COLOR },
      });
    }
    cursor = end;
  }
  return runs;
}

/**
 * Colour the category cell of a contiguous block of data rows without touching
 * the stored value: each entry in `displayValues` is one row's category-cell
 * text, and only its per-category colour runs are (re)applied. `firstRowIndex`
 * is the zero-based sheet row of the first entry.
 */
export function categoryColorRequests(
  sheetId: number,
  categoryColumnIndex: number,
  displayValues: string[],
  firstRowIndex: number
): BatchUpdateRequest[] {
  if (displayValues.length === 0) return [];

  const rows = displayValues.map((text) => ({
    values: [{ textFormatRuns: categoryTextRuns(text) }],
  }));

  return [
    {
      updateCells: {
        rows,
        fields: "textFormatRuns",
        range: {
          sheetId,
          startRowIndex: firstRowIndex,
          endRowIndex: firstRowIndex + displayValues.length,
          startColumnIndex: categoryColumnIndex,
          endColumnIndex: categoryColumnIndex + 1,
        },
      },
    },
  ];
}

// ── On-sheet filtering (native basic filter) ─────────────────────────────────

/**
 * Apply a native basic filter over the whole table so every column header gets a
 * filter dropdown (funnel) directly on the sheet. The range is open-ended (no end
 * row) so it always covers newly appended rows. Re-applying replaces the existing
 * basic filter, so this is idempotent.
 */
export function basicFilterRequest(
  sheetId: number,
  columnCount: number
): BatchUpdateRequest {
  return {
    setBasicFilter: {
      filter: {
        range: {
          sheetId,
          startRowIndex: 0,
          startColumnIndex: 0,
          endColumnIndex: columnCount,
        },
      },
    },
  };
}

/**
 * Delete embedded objects (slicers) by id — used to clean up the per-category
 * slicers created by an earlier layout so only the basic filter remains.
 */
export function deleteEmbeddedObjectRequests(
  objectIds: number[]
): BatchUpdateRequest[] {
  return objectIds.map((objectId) => ({ deleteEmbeddedObject: { objectId } }));
}

// ── Stats dashboard ──────────────────────────────────────────────────────────

const STATS_COLUMN_COUNT = 2;

/** Reset a block of stats rows back to a clean default before re-styling. */
export function statsResetRequest(
  sheetId: number,
  rowCount: number
): BatchUpdateRequest {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: rowCount,
        startColumnIndex: 0,
        endColumnIndex: STATS_COLUMN_COUNT,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 1, green: 1, blue: 1 },
          horizontalAlignment: "LEFT",
          verticalAlignment: "MIDDLE",
          borders: {},
          textFormat: { bold: false, foregroundColor: { red: 0.1, green: 0.1, blue: 0.1 } },
        },
      },
      fields:
        "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,borders,textFormat)",
    },
  };
}

/** Right-align the value column so figures line up like a dashboard. */
export function statsValueAlignRequest(
  sheetId: number,
  rowCount: number
): BatchUpdateRequest {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: rowCount,
        startColumnIndex: 1,
        endColumnIndex: 2,
      },
      cell: { userEnteredFormat: { horizontalAlignment: "RIGHT" } },
      fields: "userEnteredFormat.horizontalAlignment",
    },
  };
}

/** Style the stats title row (premium dark band, bold white text). */
export function statsTitleStyleRequest(
  sheetId: number,
  rowIndex: number
): BatchUpdateRequest {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: rowIndex,
        endRowIndex: rowIndex + 1,
        startColumnIndex: 0,
        endColumnIndex: STATS_COLUMN_COUNT,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.titleBg,
          verticalAlignment: "MIDDLE",
          textFormat: {
            bold: true,
            fontSize: 12,
            foregroundColor: COLORS.titleText,
          },
        },
      },
      fields: "userEnteredFormat(backgroundColor,verticalAlignment,textFormat)",
    },
  };
}

/** A numeric breakdown range on the stats tab that can back a column chart. */
export type StatsChartSpec = {
  title: string;
  firstDataRowIndex: number;
  rowCount: number;
};

const STATS_CHART_ANCHOR_COLUMN = 3; // column D, to the right of the A/B table
const STATS_CHART_WIDTH = 480;
const STATS_CHART_HEIGHT = 280;
const STATS_CHART_ROW_STRIDE = 16; // rows between stacked chart anchors

/**
 * Update the stats dashboard's column charts in place so overlapping syncs do
 * not delete the same embedded object. Desired breakdowns (categories, jury,
 * nominations…), stacked down the empty area to the right of the metric table.
 * Kept in its own best-effort batch by the caller.
 */
export function statsChartRequests(
  sheetId: number,
  specs: StatsChartSpec[],
  existingChartIds: number[]
): BatchUpdateRequest[] {
  const requests: BatchUpdateRequest[] = [];

  specs.forEach((spec, index) => {
    const startRowIndex = spec.firstDataRowIndex;
    const endRowIndex = spec.firstDataRowIndex + spec.rowCount;
    const labelSource = {
      sheetId,
      startRowIndex,
      endRowIndex,
      startColumnIndex: 0,
      endColumnIndex: 1,
    };
    const valueSource = {
      sheetId,
      startRowIndex,
      endRowIndex,
      startColumnIndex: 1,
      endColumnIndex: 2,
    };

    const chart = {
      spec: {
        title: spec.title,
        basicChart: {
          chartType: "COLUMN",
          legendPosition: "NO_LEGEND",
          headerCount: 0,
          domains: [{ domain: { sourceRange: { sources: [labelSource] } } }],
          series: [
            {
              series: { sourceRange: { sources: [valueSource] } },
              targetAxis: "LEFT_AXIS",
            },
          ],
        },
      },
      position: {
        overlayPosition: {
          anchorCell: {
            sheetId,
            rowIndex: 1 + index * STATS_CHART_ROW_STRIDE,
            columnIndex: STATS_CHART_ANCHOR_COLUMN,
          },
          offsetXPixels: 16,
          offsetYPixels: 0,
          widthPixels: STATS_CHART_WIDTH,
          heightPixels: STATS_CHART_HEIGHT,
        },
      },
    };

    const existingId = existingChartIds[index];
    if (existingId === undefined) {
      requests.push({ addChart: { chart } });
      return;
    }
    requests.push({
      updateChartSpec: { chartId: existingId, spec: chart.spec },
    });
    requests.push({
      updateEmbeddedObjectPosition: {
        objectId: existingId,
        newPosition: chart.position,
        fields: "overlayPosition",
      },
    });
  });

  for (const id of existingChartIds.slice(specs.length)) {
    requests.push({ deleteEmbeddedObject: { objectId: id } });
  }

  return requests;
}

/** Style a stats section header row (medium IBPA blue band, bold white). */
export function statsSectionStyleRequest(
  sheetId: number,
  rowIndex: number
): BatchUpdateRequest {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: rowIndex,
        endRowIndex: rowIndex + 1,
        startColumnIndex: 0,
        endColumnIndex: STATS_COLUMN_COUNT,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.sectionBg,
          verticalAlignment: "MIDDLE",
          textFormat: { bold: true, foregroundColor: COLORS.sectionText },
        },
      },
      fields: "userEnteredFormat(backgroundColor,verticalAlignment,textFormat)",
    },
  };
}
