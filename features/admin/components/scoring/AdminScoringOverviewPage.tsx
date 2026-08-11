import { ClipboardList, Star, TrendingUp, Users } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import NominationScoreRow, {
  type NominationScoreRowData,
} from "@/features/admin/components/scoring/NominationScoreRow";
import ScoreSummaryCard from "@/features/admin/components/scoring/ScoreSummaryCard";
import ScoringFilters, {
  type ScoringFilterState,
} from "@/features/admin/components/scoring/ScoringFilters";
import ScoringPagination from "@/features/admin/components/scoring/ScoringPagination";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardPageHeader,
} from "@/shared/components/admin/DashboardUI";

type ScoringStats = {
  totalScoreableApplications: number;
  totalScoredApplications: number;
  totalNotScoredApplications: number;
  averageCompletionPercentage: number;
  notStartedCount: number;
  inProgressCount: number;
  completeCount: number;
  totalAssignments: number;
  totalSubmittedReviews: number;
};

type ScoringPaginationState = {
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
  pageSizes: number[];
};

function share(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

/** Query-строка текущих фильтров — переиспользуется ссылками пагинации. */
function buildFilterQuery(filters: ScoringFilterState) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.progress) params.set("progress", filters.progress);
  if (filters.sort && filters.sort !== "averageScore") params.set("sort", filters.sort);
  if (filters.minScore !== undefined) params.set("minScore", String(filters.minScore));
  if (filters.maxScore !== undefined) params.set("maxScore", String(filters.maxScore));
  return params.toString();
}

/**
 * Аудит оценок: сводка по всем номинациям, доступным жюри.
 *
 * Серверный компонент — фильтрация, сортировка и пагинация выполняются в
 * запросе (`getAdminScoringOverview`), а интерактивные части (фильтры,
 * пагинация) вынесены в отдельные клиентские компоненты.
 */
export default function AdminScoringOverviewPage({
  categories,
  filters,
  stats,
  pagination,
  applications,
}: {
  categories: string[];
  filters: ScoringFilterState;
  stats: ScoringStats;
  pagination: ScoringPaginationState;
  applications: NominationScoreRowData[];
}) {
  const total = stats.totalScoreableApplications;
  const averageProgress = Math.round(stats.averageCompletionPercentage);
  const filterQuery = buildFilterQuery(filters);

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader label={adminT.scoring.label} title={adminT.scoring.title} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <ScoreSummaryCard
          label={adminT.scoring.pendingReviews}
          value={stats.notStartedCount}
          icon={ClipboardList}
          tone="blue"
          detail={adminT.scoring.ofAllNominations(share(stats.notStartedCount, total))}
        />
        <ScoreSummaryCard
          label={adminT.scoring.inProgress}
          value={stats.inProgressCount}
          icon={Users}
          tone="amber"
          detail={adminT.scoring.ofAllNominations(share(stats.inProgressCount, total))}
        />
        <ScoreSummaryCard
          label={adminT.scoring.completed}
          value={stats.completeCount}
          icon={Star}
          tone="green"
          detail={adminT.scoring.ofAllNominations(share(stats.completeCount, total))}
        />
        <ScoreSummaryCard
          label={adminT.scoring.avgCompletion}
          value={`${averageProgress}%`}
          icon={TrendingUp}
          tone="blue"
          detail={adminT.scoring.submittedOfAssigned(
            stats.totalSubmittedReviews,
            stats.totalAssignments,
          )}
        />
      </div>

      {/* key по применённым фильтрам: после навигации поля показывают то,
          что реально применено, без синхронизации состояния в эффекте. */}
      <ScoringFilters
        key={filterQuery}
        filters={filters}
        categories={categories}
        perPage={pagination.perPage}
      />

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<Star size={22} />}
            title={adminT.scoring.emptyTitle}
            description={adminT.scoring.emptyText}
          />
        </DashboardCard>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {applications.map((application) => (
              <NominationScoreRow key={application.id} row={application} />
            ))}
          </div>

          <ScoringPagination
            page={pagination.page}
            perPage={pagination.perPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSizes={pagination.pageSizes}
            query={filterQuery}
          />
        </>
      )}
    </div>
  );
}
