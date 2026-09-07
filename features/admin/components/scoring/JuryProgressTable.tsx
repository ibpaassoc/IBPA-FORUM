import Link from "next/link";
import { UsersRound } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import { DashboardCard, DashboardEmptyState } from "@/shared/components/admin/DashboardUI";

export type JuryProgressRow = {
  juryId: string;
  name: string;
  email: string;
  title: string | null;
  assigned: number;
  submitted: number;
  draft: number;
  notStarted: number;
  remaining: number;
  completion: number;
  lastActivityLabel: string | null;
  status: string;
};

export default function JuryProgressTable({ rows, detailQuery }: { rows: JuryProgressRow[]; detailQuery: string }) {
  if (rows.length === 0) {
    return <DashboardCard><DashboardEmptyState icon={<UsersRound size={22} />} title={adminT.scoring.juryProgressEmptyTitle} description={adminT.scoring.juryProgressEmptyText} /></DashboardCard>;
  }
  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full border-collapse text-left">
          <caption className="sr-only">{adminT.scoring.juryProgressTitle}</caption>
          <thead className="bg-white/60 text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-ink-muted)]">
            <tr>{[adminT.scoring.juryMember, adminT.scoring.assignedNominations, adminT.scoring.submitted, adminT.scoring.draftInProgress, adminT.scoring.notStarted, adminT.scoring.completion, adminT.scoring.lastScoringActivity, adminT.scoring.juryStatus].map((header) => <th key={header} scope="col" className="border-b border-[rgba(37,42,45,0.08)] px-4 py-3">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[rgba(37,42,45,0.08)]">
            {rows.map((row) => (
              <tr key={row.juryId} className="transition hover:bg-[var(--color-blue-wash)]/45">
                <td className="px-4 py-4 align-top">
                  <Link href={`/admin/scoring/jury/${row.juryId}${detailQuery ? `?${detailQuery}` : ""}`} className="font-semibold text-[var(--color-ink)] underline-offset-4 hover:text-[var(--color-blue)] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]">{row.name}</Link>
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{row.email}</p>
                </td>
                <td className="px-4 py-4 align-top text-sm font-semibold text-[var(--color-ink)]">{row.assigned}</td>
                <td className="px-4 py-4 align-top text-sm font-semibold text-emerald-700">{row.submitted}</td>
                <td className="px-4 py-4 align-top text-sm font-semibold text-amber-700">{row.draft}</td>
                <td className="px-4 py-4 align-top text-sm text-[var(--color-ink-soft)]">{row.notStarted}</td>
                <td className="px-4 py-4 align-top">
                  <div className="flex min-w-32 items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgba(3,2,19,0.08)]"><div className="h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${row.completion}%` }} /></div><span className="w-9 text-right text-xs font-semibold text-[var(--color-ink)]">{row.completion}%</span></div>
                </td>
                <td className="px-4 py-4 align-top text-xs leading-5 text-[var(--color-ink-soft)]">{row.lastActivityLabel ?? adminT.scoring.neverActive}</td>
                <td className="px-4 py-4 align-top"><span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-3 text-[0.65rem] font-semibold text-[#356f98]">{adminT.scoring.juryStatuses[row.status] ?? row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
