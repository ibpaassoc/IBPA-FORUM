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
    <PageShell className="px-6 py-10 text-white md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="page-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              Scoring Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Participant scoring overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4ca]">
              Monitor judging progress, submitted scores, category rankings, and score
              completion across the championship.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/applications"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Participant Admin
            </Link>
            <Link
              href="/admin/jury-applications"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Jury Admin
            </Link>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
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
            <div key={item.label} className="page-card rounded-2xl bg-white/4.5 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="page-card mt-6 rounded-3xl p-4 md:p-6">
          <form className="grid gap-4 lg:grid-cols-[1.15fr_0.9fr_0.8fr_0.8fr_auto]">
            <input
              type="text"
              name="q"
              defaultValue={filters.q}
              placeholder="Search participant name"
              className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d8c27a] focus:bg-white/7"
            />

            <select
              name="category"
              defaultValue={filters.category ?? ""}
              className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d8c27a] focus:bg-white/7"
            >
              <option value="" className="bg-[#101010] text-white">
                All Categories
              </option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-[#101010] text-white">
                  {category}
                </option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d8c27a] focus:bg-white/7"
            >
              <option value="" className="bg-[#101010] text-white">
                All Statuses
              </option>
              {["NOT_STARTED", "IN_PROGRESS", "COMPLETE"].map((status) => (
                <option key={status} value={status} className="bg-[#101010] text-white">
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={filters.sort}
              className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d8c27a] focus:bg-white/7"
            >
              <option value="averageScore" className="bg-[#101010] text-white">
                Sort by Average Score
              </option>
              <option value="category" className="bg-[#101010] text-white">
                Sort by Category
              </option>
              <option value="status" className="bg-[#101010] text-white">
                Sort by Status
              </option>
            </select>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093]"
            >
              Apply
            </button>
          </form>

          <div className="mt-6 hidden grid-cols-[1.2fr_0.9fr_1fr_0.85fr_0.85fr_0.85fr_0.75fr_0.75fr] gap-4 border-b border-white/10 px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9d4ca]/65 xl:grid">
            <span>Participant</span>
            <span>Category</span>
            <span>Award</span>
            <span>Assigned</span>
            <span>Scored</span>
            <span>Average</span>
            <span>Status</span>
            <span>Rank</span>
          </div>

          <div className="divide-y divide-white/10">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 transition hover:bg-white/2 xl:grid-cols-[1.2fr_0.9fr_1fr_0.85fr_0.85fr_0.85fr_0.75fr_0.75fr_auto] xl:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{application.fullName}</p>
                  <p className="mt-1 text-sm text-[#d9d4ca]/80">{application.email}</p>
                </div>

                <div className="text-sm text-[#d9d4ca]">{application.categoryName}</div>
                <div className="text-sm text-[#d9d4ca]">{application.awardName}</div>
                <div className="text-sm text-[#d9d4ca]">{application.assignedJudgeCount}</div>
                <div className="text-sm text-[#d9d4ca]">{application.submittedJudgeCount}</div>
                <div className="text-sm text-[#d9d4ca]">{application.averageScoreLabel}</div>
                <div>
                  <ScoreStatusBadge status={application.status} />
                </div>
                <div className="text-sm text-[#d9d4ca]">
                  {application.rank ?? "Not ranked"}
                </div>

                <div>
                  <Link
                    href={`/admin/scoring/${application.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#e2d093]"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#d9d4ca]/75">
                No participant applications matched this scoring filter.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
