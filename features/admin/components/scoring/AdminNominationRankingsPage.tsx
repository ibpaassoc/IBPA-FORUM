import { adminT } from "@/lib/i18n/admin";
import type { getAdminNominationRankings } from "@/features/admin/server/scoring-management";
import NominationRankingFilters from "@/features/admin/components/scoring/NominationRankingFilters";
import NominationRankingTable from "@/features/admin/components/scoring/NominationRankingTable";
import ScoringPagination from "@/features/admin/components/scoring/ScoringPagination";
import { DashboardSection } from "@/shared/components/admin/DashboardUI";

type Data = Awaited<ReturnType<typeof getAdminNominationRankings>>;

export default function AdminNominationRankingsPage({
  data,
  searchParams,
}: {
  data: Data;
  searchParams: Record<string, string | undefined>;
}) {
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "rankPage" && key !== "rankPerPage") queryParams.set(key, value);
  }

  return (
    <DashboardSection
      eyebrow={adminT.scoring.label}
      title={adminT.scoring.rankingsTitle}
    >
      <p className="max-w-3xl text-sm leading-6 text-[var(--color-ink-soft)]">
        {adminT.scoring.rankingsDescription}
      </p>
      <NominationRankingFilters
        filters={data.filters}
        options={data.options}
        searchParams={searchParams}
      />
      <NominationRankingTable rows={data.rows} />
      {data.pagination.totalCount > 0 ? (
        <ScoringPagination
          {...data.pagination}
          query={queryParams.toString()}
          pageParam="rankPage"
          perPageParam="rankPerPage"
          defaultPageSize={25}
        />
      ) : null}
    </DashboardSection>
  );
}
