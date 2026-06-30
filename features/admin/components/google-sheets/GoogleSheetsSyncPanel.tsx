"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import {
  DashboardCard,
  DashboardPanel,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

type SyncScope = "all" | "applications" | "jury" | "scores" | "tickets" | "stats";

type SyncResult = {
  applications: number | null;
  jury: number | null;
  scores: number | null;
  tickets: number | null;
  statsUpdated: boolean;
  errors: string[];
};

type Outcome =
  | { kind: "success"; scope: SyncScope; result: SyncResult }
  | { kind: "error"; scope: SyncScope; message: string }
  | null;

const SCOPE_LABELS: Record<SyncScope, string> = {
  all: "Sync All Data to Google Sheets",
  applications: "Sync Applications",
  jury: "Sync Jury",
  scores: "Sync Scores",
  tickets: "Sync Tickets",
  stats: "Refresh Statistics",
};

function ResultLine({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--color-ink-soft)]">{label}</span>
      <span className="font-[var(--font-title-family)] text-lg font-light tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default function GoogleSheetsSyncPanel({ configured }: { configured: boolean }) {
  const [pending, setPending] = useState<SyncScope | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);

  async function runSync(scope: SyncScope) {
    setPending(scope);
    setOutcome(null);

    try {
      const response = await fetch("/api/admin/google-sheets/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; result?: SyncResult; message?: string }
        | null;

      if (!response.ok || !payload?.result) {
        setOutcome({
          kind: "error",
          scope,
          message: payload?.message ?? "The sync request failed. Check the server logs.",
        });
        return;
      }

      setOutcome({ kind: "success", scope, result: payload.result });
    } catch {
      setOutcome({
        kind: "error",
        scope,
        message: "Could not reach the server. Please try again.",
      });
    } finally {
      setPending(null);
    }
  }

  const busy = pending !== null;

  const secondaryActions: Array<{ scope: SyncScope; icon: typeof Users }> = [
    { scope: "applications", icon: FileSpreadsheet },
    { scope: "jury", icon: Users },
    { scope: "scores", icon: Star },
    { scope: "tickets", icon: Ticket },
    { scope: "stats", icon: RefreshCw },
  ];

  return (
    <DashboardCard>
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[16px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          <Database aria-hidden size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.02em]">
            Google Sheets sync
          </h2>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Export every record into the connected spreadsheet. Syncs upsert by ID, so
            running them repeatedly is safe and never creates duplicate rows.
          </p>
        </div>
      </div>

      {!configured ? (
        <DashboardPanel className="mt-5 border-amber-200 bg-amber-50/70">
          <div className="flex items-start gap-3">
            <AlertTriangle aria-hidden size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-[var(--color-ink)]">
              Google Sheets is not configured. Set <code>GOOGLE_SHEETS_CLIENT_EMAIL</code>,{" "}
              <code>GOOGLE_SHEETS_PRIVATE_KEY</code> and{" "}
              <code>GOOGLE_SHEETS_SPREADSHEET_ID</code>, then reload this page. See{" "}
              <code>docs/google-sheets-sync.md</code> for setup steps.
            </p>
          </div>
        </DashboardPanel>
      ) : null}

      <div className="mt-5 flex flex-col gap-3">
        <DashboardPrimaryBtn
          type="button"
          disabled={!configured || busy}
          onClick={() => void runSync("all")}
          className="w-full justify-center"
        >
          {pending === "all" ? (
            <Loader2 aria-hidden size={16} className="animate-spin" />
          ) : (
            <Database aria-hidden size={16} />
          )}
          {SCOPE_LABELS.all}
        </DashboardPrimaryBtn>

        <div className="grid gap-2 sm:grid-cols-2">
          {secondaryActions.map(({ scope, icon: Icon }) => (
            <DashboardSecondaryBtn
              key={scope}
              type="button"
              disabled={!configured || busy}
              onClick={() => void runSync(scope)}
              className="justify-center"
            >
              {pending === scope ? (
                <Loader2 aria-hidden size={16} className="animate-spin" />
              ) : (
                <Icon aria-hidden size={16} />
              )}
              {SCOPE_LABELS[scope]}
            </DashboardSecondaryBtn>
          ))}
        </div>
      </div>

      {outcome?.kind === "error" ? (
        <DashboardPanel className="mt-5 border-red-200 bg-red-50/70">
          <div className="flex items-start gap-3">
            <AlertTriangle aria-hidden size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                {SCOPE_LABELS[outcome.scope]} failed
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">{outcome.message}</p>
            </div>
          </div>
        </DashboardPanel>
      ) : null}

      {outcome?.kind === "success" ? (
        <DashboardPanel className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
              <CheckCircle2 aria-hidden size={18} className="text-green-600" />
              {SCOPE_LABELS[outcome.scope]} complete
            </p>
            <StatusBadge tone={outcome.result.errors.length === 0 ? "green" : "amber"}>
              {outcome.result.errors.length === 0 ? "No errors" : `${outcome.result.errors.length} error(s)`}
            </StatusBadge>
          </div>

          <div className="mt-4 grid gap-1.5">
            <ResultLine label="Applications synced" value={outcome.result.applications} />
            <ResultLine label="Jury synced" value={outcome.result.jury} />
            <ResultLine label="Scores synced" value={outcome.result.scores} />
            <ResultLine label="Tickets synced" value={outcome.result.tickets} />
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--color-ink-soft)]">Statistics updated</span>
              <span className="font-medium">
                {outcome.result.statsUpdated ? "Yes" : "No"}
              </span>
            </div>
          </div>

          {outcome.result.errors.length > 0 ? (
            <ul className="mt-4 space-y-1 border-t border-[rgba(37,42,45,0.08)] pt-3 text-sm text-red-700">
              {outcome.result.errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle aria-hidden size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </DashboardPanel>
      ) : null}
    </DashboardCard>
  );
}
