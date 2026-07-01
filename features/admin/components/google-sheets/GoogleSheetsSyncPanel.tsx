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
import { adminT } from "@/lib/i18n/admin";
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

type LastSync = { at: string; ok: boolean; scope: string } | null;

const SCOPE_LABELS: Record<SyncScope, string> = adminT.sheets.scopeLabels;

function formatTimestamp(iso: string | null): string {
  if (!iso) return adminT.sheets.never;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return adminT.sheets.never;
  return date.toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

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

export default function GoogleSheetsSyncPanel({
  configured,
  lastSync,
}: {
  configured: boolean;
  lastSync: LastSync;
}) {
  const [pending, setPending] = useState<SyncScope | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    lastSync?.at ?? null
  );
  const [lastOk, setLastOk] = useState<boolean | null>(
    lastSync ? lastSync.ok : null
  );

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
        | { ok?: boolean; result?: SyncResult; message?: string; syncedAt?: string }
        | null;

      if (!response.ok || !payload?.result) {
        setOutcome({
          kind: "error",
          scope,
          message: payload?.message ?? adminT.sheets.requestFailed,
        });
        return;
      }

      setOutcome({ kind: "success", scope, result: payload.result });
      setLastSyncedAt(payload.syncedAt ?? new Date().toISOString());
      setLastOk(payload.result.errors.length === 0);
    } catch {
      setOutcome({
        kind: "error",
        scope,
        message: adminT.sheets.serverUnreachable,
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

  const connectionTone = configured ? "green" : "amber";
  const lastSyncTone = lastOk == null ? "neutral" : lastOk ? "green" : "red";

  return (
    <DashboardCard>
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[16px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          <Database aria-hidden size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.02em]">
              {adminT.sheets.panelTitle}
            </h2>
            <StatusBadge tone={connectionTone}>
              {configured ? adminT.sheets.connected : adminT.sheets.notConfigured}
            </StatusBadge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            {adminT.sheets.description}
          </p>
        </div>
      </div>

      {/* Last sync status strip */}
      <DashboardPanel className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-ink-soft)]">{adminT.sheets.lastSync}</span>
            <span className="font-medium text-[var(--color-ink)]">
              {formatTimestamp(lastSyncedAt)}
            </span>
          </div>
          <StatusBadge tone={lastSyncTone}>
            {lastOk == null ? adminT.sheets.noSyncYet : lastOk ? adminT.sheets.success : adminT.sheets.completedWithErrors}
          </StatusBadge>
        </div>
      </DashboardPanel>

      {!configured ? (
        <DashboardPanel className="mt-3 border-amber-200 bg-amber-50/70">
          <div className="flex items-start gap-3">
            <AlertTriangle aria-hidden size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-[var(--color-ink)]">
              {adminT.sheets.notConfiguredWarning} <code>docs/google-sheets-sync.md</code>.
              <br />
              <code>GOOGLE_SHEETS_CLIENT_EMAIL</code>, <code>GOOGLE_SHEETS_PRIVATE_KEY</code>,{" "}
              <code>GOOGLE_SHEETS_SPREADSHEET_ID</code>
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
                {SCOPE_LABELS[outcome.scope]} {adminT.sheets.failedSuffix}
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
              {SCOPE_LABELS[outcome.scope]} {adminT.sheets.completeSuffix}
            </p>
            <StatusBadge tone={outcome.result.errors.length === 0 ? "green" : "amber"}>
              {outcome.result.errors.length === 0
                ? adminT.sheets.noErrors
                : `${adminT.sheets.errorsCount} ${outcome.result.errors.length}`}
            </StatusBadge>
          </div>

          <div className="mt-4 grid gap-1.5">
            <ResultLine label={adminT.sheets.syncedApplications} value={outcome.result.applications} />
            <ResultLine label={adminT.sheets.syncedJury} value={outcome.result.jury} />
            <ResultLine label={adminT.sheets.syncedScores} value={outcome.result.scores} />
            <ResultLine label={adminT.sheets.syncedTickets} value={outcome.result.tickets} />
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--color-ink-soft)]">{adminT.sheets.statsUpdated}</span>
              <span className="font-medium">
                {outcome.result.statsUpdated ? adminT.common.yes : adminT.common.no}
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
