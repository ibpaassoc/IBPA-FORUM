import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { setSiteSetting } from "@/features/settings/server/site-settings";
import {
  GOOGLE_SHEETS_LAST_SYNC_KEY,
  isGoogleSheetsConfigured,
  syncAllApplications,
  syncAllJury,
  syncAllScores,
  syncAllTickets,
  syncAllToSheets,
  syncStatsToSheet,
} from "@/features/google-sheets";
import { adminT } from "@/lib/i18n/admin";

// Backfills can touch many rows; give the function room on Vercel.
export const maxDuration = 60;

const bodySchema = z.object({
  scope: z.enum(["all", "applications", "jury", "scores", "tickets", "stats"]),
});

type SyncResponse = {
  applications: number | null;
  jury: number | null;
  scores: number | null;
  tickets: number | null;
  statsUpdated: boolean;
  errors: string[];
};

function emptyResponse(): SyncResponse {
  return {
    applications: null,
    jury: null,
    scores: null,
    tickets: null,
    statsUpdated: false,
    errors: [],
  };
}

async function runScope(scope: z.infer<typeof bodySchema>["scope"]): Promise<SyncResponse> {
  if (scope === "all") {
    const result = await syncAllToSheets();
    return {
      applications: result.applications,
      jury: result.jury,
      scores: result.scores,
      tickets: result.tickets,
      statsUpdated: result.statsUpdated,
      errors: result.errors,
    };
  }

  const response = emptyResponse();

  if (scope === "stats") {
    try {
      await syncStatsToSheet();
      response.statsUpdated = true;
    } catch (error) {
      console.error("Google Sheets statistics sync failed", error);
      response.errors.push(`${adminT.sheets.scopeLabels.stats}: ${adminT.actions.genericError}`);
    }
    return response;
  }

  try {
    if (scope === "applications") response.applications = await syncAllApplications();
    else if (scope === "jury") response.jury = await syncAllJury();
    else if (scope === "scores") response.scores = await syncAllScores();
    else if (scope === "tickets") response.tickets = await syncAllTickets();
  } catch (error) {
    console.error(`Google Sheets ${scope} sync failed`, error);
    response.errors.push(
      `${adminT.sheets.scopeLabels[scope]}: ${adminT.actions.genericError}`,
    );
  }

  // Keep the statistics tab in step after any single-domain backfill.
  try {
    await syncStatsToSheet();
    response.statsUpdated = true;
  } catch (error) {
    console.error("Google Sheets statistics sync failed", error);
    response.errors.push(`${adminT.sheets.scopeLabels.stats}: ${adminT.actions.genericError}`);
  }

  return response;
}

/**
 * POST /api/admin/google-sheets/sync
 *
 * Admin-only on-demand sync/backfill. Body: { scope }. Always upserts (never
 * duplicates) and returns per-domain counts plus any collected errors.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: adminT.api.unauthorized }, { status: 401 });
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      {
        message: adminT.api.sheetsNotConfigured,
      },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: adminT.api.invalidJson }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: adminT.api.invalidSyncScope }, { status: 400 });
  }

  const result = await runScope(parsed.data.scope);
  const ok = result.errors.length === 0;

  // Persist last-sync metadata so the admin UI can show status + timestamp even
  // after a reload. Best-effort: never let this break the sync response.
  const syncedAt = new Date().toISOString();
  try {
    await setSiteSetting(
      GOOGLE_SHEETS_LAST_SYNC_KEY,
      JSON.stringify({ at: syncedAt, ok, scope: parsed.data.scope })
    );
  } catch (error) {
    console.error("Failed to persist Google Sheets last-sync metadata", error);
  }

  return NextResponse.json({ ok, result, syncedAt });
}
