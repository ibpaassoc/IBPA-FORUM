import "server-only";

/**
 * Central configuration + constants for the Google Sheets sync integration.
 *
 * Credentials are read from environment variables ONLY — never hardcoded and
 * never exposed to the client (every module in this feature is server-only).
 * When the variables are missing the integration is treated as "not configured"
 * and every sync becomes a safe no-op, so the rest of the platform keeps working
 * with or without the integration enabled.
 */

export const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

/** Canonical tab names — these must match the tabs in the spreadsheet. */
export const SHEET_TABS = {
  applications: "applications",
  jury: "jury",
  scores: "scores",
  tickets: "tickets",
  stats: "stats",
} as const;

export type SheetTab = (typeof SHEET_TABS)[keyof typeof SHEET_TABS];

export type GoogleSheetsConfig = {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
};

/**
 * Normalize a service-account private key supplied through an environment
 * variable. Hosting providers (and `.env` files) commonly store the multiline
 * PEM with escaped `\n` sequences and/or surrounding quotes, so we restore the
 * real newlines required for RS256 signing.
 */
export function normalizePrivateKey(raw: string): string {
  let key = raw.trim();

  // Strip a single pair of wrapping quotes if present.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // Convert escaped newlines (\n, \r\n) into real newlines.
  key = key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");

  return key;
}

/**
 * Resolve the integration configuration from environment variables. Returns
 * `null` (rather than throwing) when the integration is not configured so that
 * callers can no-op silently.
 */
export function getGoogleSheetsConfig(): GoogleSheetsConfig | null {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();

  if (!clientEmail || !privateKeyRaw || !spreadsheetId) {
    return null;
  }

  const privateKey = normalizePrivateKey(privateKeyRaw);
  if (!privateKey) {
    return null;
  }

  return { clientEmail, privateKey, spreadsheetId };
}

/** Whether the Google Sheets integration has complete credentials available. */
export function isGoogleSheetsConfigured(): boolean {
  return getGoogleSheetsConfig() !== null;
}
