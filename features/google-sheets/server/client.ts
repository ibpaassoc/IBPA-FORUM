import "server-only";
import { getAccessToken } from "./auth";
import {
  getGoogleSheetsConfig,
  SHEETS_API_BASE,
  type GoogleSheetsConfig,
} from "./config";

/**
 * Thin, typed wrapper around the Google Sheets v4 REST API. Every method is a
 * single authenticated `fetch`, keeping the integration dependency-free and easy
 * to reason about. All Google Sheets network access flows through here.
 */

export type SheetValues = (string | number | boolean | null)[][];

export type SheetProperties = {
  sheetId: number;
  title: string;
};

/** Sheet identity plus the number of conditional-format rules it carries. */
export type SheetMeta = SheetProperties & {
  conditionalFormatCount: number;
  /** Object ids of the embedded slicers on this tab (for idempotent rebuild). */
  slicerIds: number[];
  /** Chart ids embedded on this tab (for idempotent dashboard charts). */
  chartIds: number[];
};

export type BatchUpdateRequest = Record<string, unknown>;

export type SheetsClient = {
  readonly spreadsheetId: string;
  /** Read a value range, e.g. `applications!A:A`. Returns `[]` when empty. */
  getValues(range: string): Promise<SheetValues>;
  /** Read several value ranges in one round trip (results align with input). */
  batchGetValues(ranges: string[]): Promise<SheetValues[]>;
  /** Overwrite a value range (RAW input, so cells are stored verbatim). */
  updateValues(range: string, values: SheetValues): Promise<void>;
  /** Append rows after the last populated row of a table. */
  appendValues(range: string, values: SheetValues): Promise<void>;
  /** Overwrite several value ranges in one round trip. */
  batchUpdateValues(
    entries: Array<{ range: string; values: SheetValues }>
  ): Promise<void>;
  /** Clear all values in a range without touching formatting. */
  clearValues(range: string): Promise<void>;
  /** Clear several value ranges in one round trip. */
  batchClearValues(ranges: string[]): Promise<void>;
  /** List the spreadsheet's sheet/tab properties (id + title). */
  getSheetProperties(): Promise<SheetProperties[]>;
  /** Like {@link getSheetProperties} but also reports conditional-rule counts. */
  getSheetMeta(): Promise<SheetMeta[]>;
  /** Issue structural requests (add sheet, formatting, freeze, widths, …). */
  batchUpdate(requests: BatchUpdateRequest[]): Promise<void>;
};

class GoogleSheetsRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "GoogleSheetsRequestError";
  }
}

async function authedFetch(
  config: GoogleSheetsConfig,
  path: string,
  init?: RequestInit
): Promise<unknown> {
  const token = await getAccessToken(config);
  const url = `${SHEETS_API_BASE}/${config.spreadsheetId}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    // The spreadsheet is the source of truth; never serve a stale cached copy.
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new GoogleSheetsRequestError(
      response.status,
      `Google Sheets API ${init?.method ?? "GET"} ${path} failed (${response.status}): ${detail}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json().catch(() => null);
}

function encodeRange(range: string): string {
  return encodeURIComponent(range);
}

/**
 * Build a Sheets client bound to the configured spreadsheet. Throws when the
 * integration is not configured — callers that may run without credentials
 * should gate on {@link isGoogleSheetsConfigured} first.
 */
export function getSheetsClient(): SheetsClient {
  const config = getGoogleSheetsConfig();
  if (!config) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY and GOOGLE_SHEETS_SPREADSHEET_ID."
    );
  }

  return {
    spreadsheetId: config.spreadsheetId,

    async getValues(range) {
      const data = (await authedFetch(
        config,
        `/values/${encodeRange(range)}`
      )) as { values?: SheetValues } | null;
      return data?.values ?? [];
    },

    async batchGetValues(ranges) {
      if (ranges.length === 0) return [];
      const query = ranges
        .map((range) => `ranges=${encodeRange(range)}`)
        .join("&");
      const data = (await authedFetch(
        config,
        `/values:batchGet?${query}&majorDimension=ROWS`
      )) as { valueRanges?: Array<{ values?: SheetValues }> } | null;
      // valueRanges come back in request order; default any missing to empty.
      return ranges.map((_, index) => data?.valueRanges?.[index]?.values ?? []);
    },

    async updateValues(range, values) {
      await authedFetch(
        config,
        `/values/${encodeRange(range)}?valueInputOption=RAW`,
        {
          method: "PUT",
          body: JSON.stringify({ range, values }),
        }
      );
    },

    async appendValues(range, values) {
      await authedFetch(
        config,
        `/values/${encodeRange(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          body: JSON.stringify({ range, values }),
        }
      );
    },

    async batchUpdateValues(entries) {
      if (entries.length === 0) return;
      await authedFetch(config, `/values:batchUpdate`, {
        method: "POST",
        body: JSON.stringify({
          valueInputOption: "RAW",
          data: entries.map((entry) => ({
            range: entry.range,
            values: entry.values,
          })),
        }),
      });
    },

    async clearValues(range) {
      await authedFetch(config, `/values/${encodeRange(range)}:clear`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },

    async batchClearValues(ranges) {
      if (ranges.length === 0) return;
      await authedFetch(config, `/values:batchClear`, {
        method: "POST",
        body: JSON.stringify({ ranges }),
      });
    },

    async getSheetProperties() {
      const data = (await authedFetch(
        config,
        `?fields=sheets.properties(sheetId,title)`
      )) as { sheets?: Array<{ properties?: SheetProperties }> } | null;

      return (data?.sheets ?? [])
        .map((sheet) => sheet.properties)
        .filter((props): props is SheetProperties => Boolean(props));
    },

    async getSheetMeta() {
      const data = (await authedFetch(
        config,
        `?fields=sheets(properties(sheetId,title),conditionalFormats,slicers(slicerId),charts(chartId))`
      )) as
        | {
            sheets?: Array<{
              properties?: SheetProperties;
              conditionalFormats?: unknown[];
              slicers?: Array<{ slicerId?: number }>;
              charts?: Array<{ chartId?: number }>;
            }>;
          }
        | null;

      const numericIds = (
        items: Array<{ slicerId?: number; chartId?: number }> | undefined,
        key: "slicerId" | "chartId"
      ): number[] =>
        (items ?? [])
          .map((item) => item[key])
          .filter((id): id is number => typeof id === "number");

      return (data?.sheets ?? [])
        .map((sheet) =>
          sheet.properties
            ? {
                ...sheet.properties,
                conditionalFormatCount: sheet.conditionalFormats?.length ?? 0,
                slicerIds: numericIds(sheet.slicers, "slicerId"),
                chartIds: numericIds(sheet.charts, "chartId"),
              }
            : null
        )
        .filter((meta): meta is SheetMeta => Boolean(meta));
    },

    async batchUpdate(requests) {
      if (requests.length === 0) return;
      await authedFetch(config, `:batchUpdate`, {
        method: "POST",
        body: JSON.stringify({ requests }),
      });
    },
  };
}
