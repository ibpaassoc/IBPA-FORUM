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
      <JuryProgressFilters filters={data.filters} options={data.options} searchParams={searchParams} />
      <JuryProgressTable rows={data.rows} detailQuery={detailQuery.toString()} />
      {data.pagination.totalCount > 0 ? <ScoringPagination {...data.pagination} query={paginationQuery.toString()} pageParam="juryPage" perPageParam="juryPerPage" defaultPageSize={25} totalLabel={`Всего членов жюри: ${data.pagination.totalCount}`} /> : null}
    </DashboardSection>
  );
}
