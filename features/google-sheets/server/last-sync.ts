import "server-only";
import { getSiteSetting } from "@/features/settings/server/site-settings";

/**
 * Lightweight persistence for "when did we last run a manual sync, and did it
 * succeed". Stored in the existing SiteSetting key/value table so the admin UI
 * can show last-sync status and timestamp across reloads without new schema.
 */

export const GOOGLE_SHEETS_LAST_SYNC_KEY = "googleSheetsLastSync";

export type LastSyncMeta = {
  at: string; // ISO timestamp
  ok: boolean;
  scope: string;
};

export async function readLastSyncMeta(): Promise<LastSyncMeta | null> {
  const raw = await getSiteSetting(GOOGLE_SHEETS_LAST_SYNC_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<LastSyncMeta>;
    if (typeof parsed.at !== "string") return null;
    return {
      at: parsed.at,
      ok: Boolean(parsed.ok),
      scope: typeof parsed.scope === "string" ? parsed.scope : "all",
    };
  } catch {
    return null;
  }
}
