import {
  AdminDashboardShell,
  AdminDataRow,
  AdminDataTable,
  AdminEmptyState,
  AdminHeroCard,
  AdminSection,
  AdminStatCard,
  AdminToolbarButton,
} from "@/shared/components/admin/AdminDashboard";

const scoringGrid = "grid-cols-[1.4fr_0.8fr_1.4fr_0.6fr] items-center";

export default function AdminScoringOverviewPage({
  categories,
  filters,
  stats,
  applications,
}: {
  categories: string[];
  filters: {
    category?: string;
    status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
    q: string;
    sort: "averageScore" | "direction" | "status";
  };
  stats: {
    totalScoreableApplications: number;
    totalScoredApplications: number;
    totalNotScoredApplications: number;
    averageCompletionPercentage: number;
  };
  applications: Array<{
    id: string;
    fullName: string;
    email: string;
    categoryName: string;
    awardName: string;
    assignedJudgeCount: number;
    submittedJudgeCount: number;
    averageScore: number | null;
    averageScoreLabel: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
    rank: number | null;
  }>;
}) {
  return (
    <AdminDashboardShell>
      <AdminHeroCard
        eyebrow="Scoring Admin"
        title="Participant scoring overview"
        subtitle="Monitor judging progress, submitted scores, direction rankings, and score completion across the award."
        actions={
          <>
            <AdminToolbarButton href="/admin/applications">
              Participants
            </AdminToolbarButton>
            <AdminToolbarButton href="/admin/jury-applications">
              Juries
            </AdminToolbarButton>
          </>
        }
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Scoreable Applications"
          value={stats.totalScoreableApplications}
        />
        <AdminStatCard label="Scored" value={stats.totalScoredApplications} />
        <AdminStatCard
          label="Not Scored"
          value={stats.totalNotScoredApplications}
        />
        <AdminStatCard
          label="Avg Completion"
          value={`${stats.averageCompletionPercentage.toFixed(0)}%`}
        />
      </div>

      <AdminSection className="mt-5">
        {/* MOBILE FILTERS */}
        <details className="group lg:hidden">
            <summary className="admin-field flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-(--admin-ink)">
                <span>Filters</span>
                <span className="transition group-open:rotate-180">⌄</span>
            </summary>

            <form className="mt-3 grid gap-2 rounded-2xl border border-[rgba(37,42,45,0.08)] bg-white/70 p-3">
                <input
                type="text"
                name="q"
                defaultValue={filters.q}
                placeholder="Search by name"
                className="admin-field rounded-xl px-3 py-2 text-sm outline-none"
                />

                <select
                name="direction"
                defaultValue={filters.category ?? ""}
                className="admin-field rounded-xl px-3 py-2 text-sm outline-none"
                >
                <option value="">All Categories</option>

                {categories.map((category) => (
                    <option key={category} value={category}>
                    {category}
                    </option>
                ))}
                </select>

                <select
                name="status"
                defaultValue={filters.status ?? ""}
                className="admin-field rounded-xl px-3 py-2 text-sm outline-none"
                >
                <option value="">All Statuses</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETE">Complete</option>
                </select>

                <select
                name="sort"
                defaultValue={filters.sort}
                className="admin-field rounded-xl px-3 py-2 text-sm outline-none"
                >
                <option value="averageScore">Average Score</option>
                <option value="direction">Direction</option>
                <option value="status">Status</option>
                </select>

                <button
                type="submit"
                className="admin-action-primary rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
                >
                Apply
                </button>
            </form>
        </details>

        {/* DESKTOP FILTERS */}
        <form className="hidden gap-3 lg:grid lg:grid-cols-[1.15fr_0.9fr_0.8fr_0.8fr_auto] lg:items-center">
            <input
                type="text"
                name="q"
                defaultValue={filters.q}
                placeholder="Search by name"
                className="admin-field rounded-xl px-3 py-2 text-sm outline-none"
            />

            <select
                name="direction"
                defaultValue={filters.category ?? ""}
                className="admin-field rounded-xl px-3 py-2 text-sm outline-none"
            >
                <option value="">All Categories</option>

                {categories.map((category) => (
                <option key={category} value={category}>
                    {category}
                </option>
                ))}
            </select>

            <select
                name="status"
                defaultValue={filters.status ?? ""}
                className="admin-field rounded-xl px-3 py-2 text-sm outline-none"
            >
                <option value="">All Statuses</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETE">Complete</option>
            </select>

            <select
                name="sort"
                defaultValue={filters.sort}
                className="admin-field rounded-xl px-3 py-2 text-sm outline-none"
            >
                <option value="averageScore">Average Score</option>
                <option value="direction">Direction</option>
                <option value="status">Status</option>
            </select>

            <button
                type="submit"
                className="admin-action-primary rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
            >
                Apply
            </button>
        </form>

        <AdminDataTable
          className="mt-5"
          headers={["Participant", "Direction", "Nomination", "Average"]}
          gridClassName={scoringGrid}
        >
          {applications.map((application) => (
            <AdminDataRow
              key={application.id}
              gridClassName={scoringGrid}
              href={`/admin/scoring/${application.id}`}
            >
              <div>
                <p className="justify-self-center text-sm font-semibold text-(--admin-ink)">
                  {application.fullName}
                </p>
                <p className="justify-self-center admin-muted mt-1 text-sm">
                  {application.email}
                </p>
              </div>

              <div className="justify-self-center text-sm text-(--admin-ink)">
                {application.categoryName}
              </div>

              <div className="justify-self-center text-sm text-(--admin-ink)">
                {application.awardName}
              </div>

              <div className="justify-self-center text-sm font-semibold text-(--admin-ink)">
                {application.averageScoreLabel}
              </div>
            </AdminDataRow>
          ))}

          {applications.length === 0 ? (
            <div className="px-4 py-5">
              <AdminEmptyState title="No participant applications matched this scoring filter." />
            </div>
          ) : null}
        </AdminDataTable>
      </AdminSection>
    </AdminDashboardShell>
  );
}
