import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import type { getAdminJuryProgressDetail } from "@/features/admin/server/scoring-management";
import ScoringPagination from "@/features/admin/components/scoring/ScoringPagination";
import ScoringStateBanner from "@/features/admin/components/scoring/ScoringStateBanner";
import type { ScoringState } from "@/features/jury/scoring/scoring-state";
import { DashboardCard, DashboardEmptyState, DashboardPageHeader, DashboardSecondaryBtn } from "@/shared/components/admin/DashboardUI";

type Data = NonNullable<Awaited<ReturnType<typeof getAdminJuryProgressDetail>>>;

export default function AdminJuryProgressDetailPage({ data, state, searchParams }: { data: Data; state: ScoringState; searchParams: Record<string, string | undefined> }) {
  const backParams = new URLSearchParams();
  const pageParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value) continue;
    if (key.startsWith("jury") || key === "tab") backParams.set(key, value);
    if (key !== "detailPage" && key !== "detailPerPage") pageParams.set(key, value);
  }
  backParams.set("tab", "jury-progress");
  const backHref = `/admin/scoring?${backParams.toString()}`;
  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={adminT.scoring.juryDetailTitle}
        title={data.jury.name}
        description={[data.jury.title, data.jury.email].filter(Boolean).join(" · ")}
        actions={<DashboardSecondaryBtn href={backHref}><ArrowLeft aria-hidden size={15} />{adminT.scoring.juryDetailBack}</DashboardSecondaryBtn>}
      />
      <ScoringStateBanner state={state} />
      {data.rows.length === 0 ? (
        <DashboardCard><DashboardEmptyState icon={<ClipboardList size={22} />} title={adminT.scoring.rankingEmptyTitle} description={adminT.scoring.rankingEmptyText} /></DashboardCard>
      ) : (
        <DashboardCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full border-collapse text-left">
              <caption className="sr-only">{adminT.scoring.juryDetailTitle}</caption>
              <thead className="bg-white/60 text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-ink-muted)]"><tr>{[adminT.scoring.competitor, adminT.scoring.nomination, adminT.scoring.selectCategory, adminT.scoring.reviewStatus, adminT.scoring.finalScore, adminT.scoring.lastScoringActivity].map((header) => <th key={header} scope="col" className="border-b border-[rgba(37,42,45,0.08)] px-4 py-3">{header}</th>)}</tr></thead>
              <tbody className="divide-y divide-[rgba(37,42,45,0.08)]">
                {data.rows.map((row) => (
                  <tr key={row.nominationId} className="hover:bg-[var(--color-blue-wash)]/45">
                    <td className="px-4 py-4 font-semibold text-[var(--color-ink)]"><Link href={`/admin/scoring/${row.nominationId}`} className="underline-offset-4 hover:text-[var(--color-blue)] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]">{row.competitorName}</Link></td>
                    <td className="px-4 py-4 text-sm text-[var(--color-ink-soft)]">{row.nominationName}</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-ink-soft)]">{row.categoryName}</td>
                    <td className="px-4 py-4"><span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-3 text-[0.65rem] font-semibold text-[#356f98]">{adminT.scoring.reviewStatuses[row.status] ?? row.status}</span></td>
                    <td className="px-4 py-4 font-[var(--font-title-family)] text-xl text-[var(--color-ink)]">{row.totalScore ?? "—"}</td>
                    <td className="px-4 py-4 text-xs text-[var(--color-ink-soft)]">{row.lastActivityLabel ?? adminT.scoring.neverActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}
      {data.pagination.totalCount > 0 ? <ScoringPagination {...data.pagination} query={pageParams.toString()} pageParam="detailPage" perPageParam="detailPerPage" defaultPageSize={25} /> : null}
    </div>
  );
}
