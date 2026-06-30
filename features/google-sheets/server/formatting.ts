import "server-only";
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

/** Colour a row when the value in `columnIndex` equals `equals` (first wins). */
export type ConditionalRule = {
  columnIndex: number;
  equals: string;
  color: RgbColor;
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
    requests.push({
      addConditionalFormatRule: {
        index,
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
          ],
          booleanRule: {
            condition: {
              type: "CUSTOM_FORMULA",
              values: [{ userEnteredValue: `=$${letter}2="${rule.equals}"` }],
            },
            format: { backgroundColor: rule.color },
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
