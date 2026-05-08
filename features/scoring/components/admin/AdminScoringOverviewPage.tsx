import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import ScoreStatusBadge from "@/features/scoring/components/ScoreStatusBadge";
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
    sort: "averageScore" | "category" | "status";
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
        subtitle="Monitor judging progress, submitted scores, category rankings, and score completion across the championship."
        actions={
          <>
            <AdminToolbarButton href="/admin/applications">
              Participant Admin
            </AdminToolbarButton>
            <AdminToolbarButton href="/admin/jury-applications">
              Jury Admin
            </AdminToolbarButton>
            <form action={logoutAdminAction}>
              <AdminToolbarButton type="submit">Log Out</AdminToolbarButton>
            </form>
          </>
        }
      />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Scoreable Applications", value: stats.totalScoreableApplications },
            { label: "Scored", value: stats.totalScoredApplications },
            { label: "Not Scored", value: stats.totalNotScoredApplications },
            {
              label: "Avg Completion",
              value: `${stats.averageCompletionPercentage.toFixed(0)}%`,
            },
          ].map((item) => (
            <AdminStatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>

        <AdminSection className="mt-5">
          <form className="grid gap-4 lg:grid-cols-[1.15fr_0.9fr_0.8fr_0.8fr_auto]">
            <input
              type="text"
              name="q"
              defaultValue={filters.q}
              placeholder="Search participant name"
              className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            />

            <select
              name="category"
              defaultValue={filters.category ?? ""}
              className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            >
              <option value="" className="bg-white text-[var(--admin-ink)]">
                All Categories
              </option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-white text-[var(--admin-ink)]">
                  {category}
                </option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            >
              <option value="" className="bg-white text-[var(--admin-ink)]">
                All Statuses
              </option>
              {["NOT_STARTED", "IN_PROGRESS", "COMPLETE"].map((status) => (
                <option key={status} value={status} className="bg-white text-[var(--admin-ink)]">
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={filters.sort}
              className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            >
              <option value="averageScore" className="bg-white text-[var(--admin-ink)]">
                Sort by Average Score
              </option>
              <option value="category" className="bg-white text-[var(--admin-ink)]">
                Sort by Category
              </option>
              <option value="status" className="bg-white text-[var(--admin-ink)]">
                Sort by Status
              </option>
            </select>

            <button
              type="submit"
              className="admin-action-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
            >
              Apply
            </button>
          </form>

          <AdminDataTable
            className="mt-5"
            headers={[
              "Participant",
              "Category",
              "Award",
              "Assigned",
              "Scored",
              "Average",
              "Status",
              "Rank",
            ]}
            gridClassName="xl:grid-cols-[1.2fr_0.9fr_1fr_0.85fr_0.85fr_0.85fr_0.75fr_0.75fr_auto] lg:grid-cols-[1.2fr_0.9fr_1fr_0.85fr_0.85fr_0.85fr_0.75fr_0.75fr_auto]"
          >
            {applications.map((application) => (
              <AdminDataRow
                key={application.id}
                gridClassName="lg:grid-cols-[1.2fr_0.9fr_1fr_0.85fr_0.85fr_0.85fr_0.75fr_0.75fr_auto]"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--admin-ink)]">{application.fullName}</p>
                  <p className="admin-muted mt-1 text-sm">{application.email}</p>
                </div>

                <div className="text-sm text-[var(--admin-ink)]">{application.categoryName}</div>
                <div className="text-sm text-[var(--admin-ink)]">{application.awardName}</div>
                <div className="text-sm text-[var(--admin-ink)]">{application.assignedJudgeCount}</div>
                <div className="text-sm text-[var(--admin-ink)]">{application.submittedJudgeCount}</div>
                <div className="text-sm text-[var(--admin-ink)]">{application.averageScoreLabel}</div>
                <div>
                  <ScoreStatusBadge status={application.status} />
                </div>
                <div className="text-sm text-[var(--admin-ink)]">
                  {application.rank ?? "Not ranked"}
                </div>

                <div>
                  <AdminToolbarButton
                    href={`/admin/scoring/${application.id}`}
                    variant="primary"
                    className="px-4 py-2"
                  >
                    View Details
                  </AdminToolbarButton>
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
