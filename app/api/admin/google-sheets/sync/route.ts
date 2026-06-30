import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import {
  isGoogleSheetsConfigured,
  syncAllApplications,
  syncAllJury,
  syncAllScores,
  syncAllTickets,
  syncAllToSheets,
  syncStatsToSheet,
} from "@/features/google-sheets";

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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
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
      response.errors.push(`statistics: ${errorMessage(error)}`);
    }
    return response;
  }

  try {
    if (scope === "applications") response.applications = await syncAllApplications();
    else if (scope === "jury") response.jury = await syncAllJury();
    else if (scope === "scores") response.scores = await syncAllScores();
    else if (scope === "tickets") response.tickets = await syncAllTickets();
  } catch (error) {
    response.errors.push(`${scope}: ${errorMessage(error)}`);
  }

  // Keep the statistics tab in step after any single-domain backfill.
  try {
    await syncStatsToSheet();
    response.statsUpdated = true;
  } catch (error) {
    response.errors.push(`statistics: ${errorMessage(error)}`);
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
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      {
        message:
          "Google Sheets is not configured. Set the GOOGLE_SHEETS_* environment variables first.",
      },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid sync scope." }, { status: 400 });
  }

  const result = await runScope(parsed.data.scope);
  return NextResponse.json({ ok: result.errors.length === 0, result });
}
