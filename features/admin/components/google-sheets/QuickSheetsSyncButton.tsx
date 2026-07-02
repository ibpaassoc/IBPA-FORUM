"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2 } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import { DashboardSecondaryBtn } from "@/shared/components/admin/DashboardUI";

/**
 * One-click full Google Sheets sync for the admin overview header. Runs the same
 * admin-only backfill as the Integrations page, shows a loading + inline result
 * state, and never blocks or reloads the dashboard if the sync fails.
 */
type State = "idle" | "loading" | "ok" | "error";

export default function QuickSheetsSyncButton() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setState("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/google-sheets/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "all" }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; result?: { errors?: string[] }; message?: string }
        | null;

      if (!response.ok || !payload?.result) {
        setState("error");
        setMessage(payload?.message ?? adminT.sheets.quickSyncFailed);
        return;
      }

      const errorCount = payload.result.errors?.length ?? 0;
      setState(errorCount === 0 ? "ok" : "error");
      setMessage(
        errorCount === 0
          ? adminT.sheets.quickSyncOk
          : adminT.sheets.quickSyncErrors(errorCount)
      );
    } catch {
      setState("error");
      setMessage(adminT.sheets.serverUnreachable);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DashboardSecondaryBtn
        type="button"
        disabled={state === "loading"}
        onClick={() => void run()}
      >
        {state === "loading" ? (
          <Loader2 aria-hidden size={16} className="animate-spin" />
        ) : (
          <FileSpreadsheet aria-hidden size={16} />
        )}
        {adminT.sheets.quickSync}
      </DashboardSecondaryBtn>

      {state === "ok" && message ? (
        <span className="hidden items-center gap-1 text-xs text-green-700 sm:inline-flex">
          <CheckCircle2 aria-hidden size={14} />
          {message}
        </span>
      ) : null}
      {state === "error" && message ? (
        <span className="hidden items-center gap-1 text-xs text-red-700 sm:inline-flex">
          <AlertTriangle aria-hidden size={14} />
          {message}
        </span>
      ) : null}
    </div>
  );
}
