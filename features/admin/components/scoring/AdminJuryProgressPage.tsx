import { LockKeyholeOpen } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import type { getAdminJuryProgress } from "@/features/admin/server/scoring-management";
import JuryProgressFilters from "@/features/admin/components/scoring/JuryProgressFilters";
import JuryProgressTable from "@/features/admin/components/scoring/JuryProgressTable";
import ScoringPagination from "@/features/admin/components/scoring/ScoringPagination";
import { DashboardSection } from "@/shared/components/admin/DashboardUI";

type Data = Awaited<ReturnType<typeof getAdminJuryProgress>>;

export default function AdminJuryProgressPage({ data, searchParams }: { data: Data; searchParams: Record<string, string | undefined> }) {
  const paginationQuery = new URLSearchParams();
  const detailQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value) continue;
    if (key !== "juryPage" && key !== "juryPerPage") paginationQuery.set(key, value);
    if (key.startsWith("jury") || key === "tab") detailQuery.set(key, value);
  }
  return (
    <DashboardSection eyebrow={adminT.scoring.label} title={adminT.scoring.juryProgressTitle}>
      <p className="max-w-3xl text-sm leading-6 text-[var(--color-ink-soft)]">{adminT.scoring.juryProgressDescription}</p>
      {data.scoringClosed ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-5 text-amber-900">
          <LockKeyholeOpen aria-hidden size={16} className="text-amber-700" />
          <p className="min-w-0 flex-1">{adminT.scoring.juryAccessHint}</p>
          {data.manuallyOpenCount > 0 ? (
            <span className="inline-flex min-h-7 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-[0.65rem] font-semibold text-emerald-800">{adminT.scoring.juryAccessManualCount(data.manuallyOpenCount)}</span>
          ) : null}
        </div>
      ) : null}
      <JuryProgressFilters filters={data.filters} options={data.options} searchParams={searchParams} />
      <JuryProgressTable rows={data.rows} detailQuery={detailQuery.toString()} scoringClosed={data.scoringClosed} />
      {data.pagination.totalCount > 0 ? <ScoringPagination {...data.pagination} query={paginationQuery.toString()} pageParam="juryPage" perPageParam="juryPerPage" defaultPageSize={25} totalLabel={`Всего членов жюри: ${data.pagination.totalCount}`} /> : null}
    </DashboardSection>
  );
}
