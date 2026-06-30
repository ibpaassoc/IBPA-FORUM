/**
 * Public surface of the Google Sheets sync feature.
 *
 * Application flows import the fire-and-forget hooks; admin tools import the
 * backfill/refresh operations and the config check. All implementation detail
 * (auth, REST client, row mapping, formatting) stays inside this module — and
 * because everything is server-only, credentials are never exposed to clients.
 */

export { isGoogleSheetsConfigured } from "./server/config";

export {
  syncApplicationOnChange,
  syncJuryOnChange,
  syncScoreOnChange,
  syncTicketOnChange,
  syncCheckInOnChange,
} from "./server/hooks";

export {
  syncAllToSheets,
  syncAllApplications,
  syncAllJury,
  syncAllScores,
  syncAllTickets,
  syncStatsToSheet,
  type SyncAllResult,
} from "./server/sync";

export {
  GOOGLE_SHEETS_LAST_SYNC_KEY,
  readLastSyncMeta,
  type LastSyncMeta,
} from "./server/last-sync";
