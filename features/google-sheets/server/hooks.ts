import "server-only";
import { after } from "next/server";
import { isGoogleSheetsConfigured } from "./config";
import {
  syncApplicationToSheet,
  syncJuryToSheet,
  syncScoreToSheet,
  syncStatsToSheet,
  syncTicketToSheet,
} from "./sync";
import { getDataScopeContext } from "@/features/test/server/data-scope";

/**
 * Fire-and-forget sync hooks for existing application flows.
 *
 * Every hook here is intentionally non-blocking and crash-proof:
 *   • work is scheduled with `after()` so it runs once the response is sent and
 *     never adds latency to (or blocks) the user's action;
 *   • all errors are caught and logged — a Google Sheets outage can never
 *     interrupt an application, payment, score, ticket, or check-in;
 *   • when the integration is not configured the hooks are complete no-ops.
 *
 * Call sites only ever pass an ID, so all spreadsheet logic stays in this module.
 */

function scheduleSheetSync(label: string, run: () => Promise<void>): void {
  if (getDataScopeContext().dataScope === "TEST") return;
  if (!isGoogleSheetsConfigured()) return;

  const task = async () => {
    try {
      await run();
    } catch (error) {
      console.error(`Google Sheets sync failed (${label})`, error);
    }
  };

  try {
    // Preferred path: run after the response is flushed (kept alive by the
    // platform's waitUntil), so the user never waits on the spreadsheet.
    after(task);
  } catch {
    // Called outside a request scope (e.g. a CLI script) — detach instead so we
    // still never throw into the caller.
    void task();
  }
}

type RecordSyncOptions = { refreshStats?: boolean };

export function syncApplicationOnChange(
  id: string,
  { refreshStats = true }: RecordSyncOptions = {}
): void {
  scheduleSheetSync(`application:${id}`, async () => {
    await syncApplicationToSheet(id);
    if (refreshStats) await syncStatsToSheet();
  });
}

export function syncJuryOnChange(
  id: string,
  { refreshStats = true }: RecordSyncOptions = {}
): void {
  scheduleSheetSync(`jury:${id}`, async () => {
    await syncJuryToSheet(id);
    if (refreshStats) await syncStatsToSheet();
  });
}

export function syncScoreOnChange(
  id: string,
  { refreshStats = false }: RecordSyncOptions = {}
): void {
  scheduleSheetSync(`score:${id}`, async () => {
    await syncScoreToSheet(id);
    if (refreshStats) await syncStatsToSheet();
  });
}

export function syncTicketOnChange(
  id: string,
  { refreshStats = true }: RecordSyncOptions = {}
): void {
  scheduleSheetSync(`ticket:${id}`, async () => {
    await syncTicketToSheet(id);
    if (refreshStats) await syncStatsToSheet();
  });
}

/** Sync the record that was just checked in, refreshing the check-in stats. */
export function syncCheckInOnChange(input: {
  kind: "TICKET" | "PARTICIPANT" | "JURY";
  id: string;
}): void {
  scheduleSheetSync(`checkin:${input.kind}:${input.id}`, async () => {
    if (input.kind === "TICKET") await syncTicketToSheet(input.id);
    else if (input.kind === "PARTICIPANT") await syncApplicationToSheet(input.id);
    else await syncJuryToSheet(input.id);
    await syncStatsToSheet();
  });
}
