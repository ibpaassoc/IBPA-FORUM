import Link from "next/link";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import ScoreStatusBadge from "@/features/scoring/components/ScoreStatusBadge";
import { PageShell } from "@/shared/components/layout/PageShell";

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
    <PageShell className="admin-page px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="admin-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="admin-eyebrow">
              Scoring Admin
            </p>
            <h1 className="admin-heading mt-4 text-3xl font-semibold sm:text-4xl">
              Participant scoring overview
            </h1>
            <p className="admin-copy mt-3 max-w-2xl text-sm leading-7">
              Monitor judging progress, submitted scores, category rankings, and score
              completion across the championship.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/applications"
              className="admin-action-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
            >
              Participant Admin
            </Link>
            <Link
              href="/admin/jury-applications"
              className="admin-action-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
            >
              Jury Admin
            </Link>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="admin-action-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Scoreable Applications", value: stats.totalScoreableApplications },
            { label: "Scored", value: stats.totalScoredApplications },
            { label: "Not Scored", value: stats.totalNotScoredApplications },
            {
              label: "Avg Completion",
              value: `${stats.averageCompletionPercentage.toFixed(0)}%`,
            },
          ].map((item) => (
            <div key={item.label} className="admin-card rounded-2xl p-5">
              <p className="admin-eyebrow">
                {item.label}
              </p>
              <p className="admin-heading mt-3 text-3xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="admin-card mt-6 rounded-3xl p-4 md:p-6">
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
              <option value="" className="bg-white text-[var(--color-navy)]">
                All Categories
              </option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-white text-[var(--color-navy)]">
                  {category}
                </option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            >
              <option value="" className="bg-white text-[var(--color-navy)]">
                All Statuses
              </option>
              {["NOT_STARTED", "IN_PROGRESS", "COMPLETE"].map((status) => (
                <option key={status} value={status} className="bg-white text-[var(--color-navy)]">
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={filters.sort}
              className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            >
              <option value="averageScore" className="bg-white text-[var(--color-navy)]">
                Sort by Average Score
              </option>
              <option value="category" className="bg-white text-[var(--color-navy)]">
                Sort by Category
              </option>
              <option value="status" className="bg-white text-[var(--color-navy)]">
                Sort by Status
              </option>
            </select>

            <button
              type="submit"
              className="admin-action-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
            >
              Apply
            </button>
          </form>

          <div className="admin-table-head mt-6 hidden grid-cols-[1.2fr_0.9fr_1fr_0.85fr_0.85fr_0.85fr_0.75fr_0.75fr] gap-4 border-b px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] xl:grid">
            <span>Participant</span>
            <span>Category</span>
            <span>Award</span>
            <span>Assigned</span>
            <span>Scored</span>
            <span>Average</span>
            <span>Status</span>
            <span>Rank</span>
          </div>

          <div className="divide-y divide-[rgba(26,38,64,0.1)]">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 transition hover:bg-[rgba(201,169,110,0.07)] xl:grid-cols-[1.2fr_0.9fr_1fr_0.85fr_0.85fr_0.85fr_0.75fr_0.75fr_auto] xl:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-navy-deep)]">{application.fullName}</p>
                  <p className="admin-muted mt-1 text-sm">{application.email}</p>
                </div>

                <div className="text-sm text-[var(--color-navy)]">{application.categoryName}</div>
                <div className="text-sm text-[var(--color-navy)]">{application.awardName}</div>
                <div className="text-sm text-[var(--color-navy)]">{application.assignedJudgeCount}</div>
                <div className="text-sm text-[var(--color-navy)]">{application.submittedJudgeCount}</div>
                <div className="text-sm text-[var(--color-navy)]">{application.averageScoreLabel}</div>
                <div>
                  <ScoreStatusBadge status={application.status} />
                </div>
                <div className="text-sm text-[var(--color-navy)]">
                  {application.rank ?? "Not ranked"}
                </div>

                <div>
                  <Link
                    href={`/admin/scoring/${application.id}`}
                    className="admin-action-primary inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="admin-empty px-4 py-12 text-center text-sm">
                No participant applications matched this scoring filter.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
