"use client";

import Link from "next/link";
import { ArrowRight, Search, Star } from "lucide-react";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardEmptyState,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPrimaryBtn,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/shared/components/admin/DashboardUI";

function scoringBadge(status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE") {
  switch (status) {
    case "COMPLETE":
      return <DashboardBadge tone="green">Complete</DashboardBadge>;
    case "IN_PROGRESS":
      return <DashboardBadge tone="amber">In progress</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">Not started</DashboardBadge>;
  }
}

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
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Scoring"
        title="Score audit"
        description="Track scoring progress, judge coverage, averages, and category rank."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Scoreable
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
            {stats.totalScoreableApplications}
          </p>
        </DashboardAccentBlock>
        <DashboardMetricTile label="Scored" value={stats.totalScoredApplications} accent="green" />
        <DashboardMetricTile label="Not scored" value={stats.totalNotScoredApplications} accent="amber" />
        <DashboardMetricTile
          label="Avg completion"
          value={`${stats.averageCompletionPercentage.toFixed(0)}%`}
          accent="blue"
        />
      </div>

      <DashboardCard>
        <details className="group lg:hidden">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-md border border-black/10 bg-[#FAFAFA] px-3 text-sm font-semibold text-[#0A0A0A]">
            <span>Filters</span>
            <span className="text-black/40 transition group-open:rotate-180">v</span>
          </summary>
          <form className="mt-3 grid gap-2">
            <input type="text" name="q" defaultValue={filters.q} placeholder="Search by name" className={dashboardInputClass} />
            <select name="category" defaultValue={filters.category ?? ""} className={dashboardSelectClass}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select name="status" defaultValue={filters.status ?? ""} className={dashboardSelectClass}>
              <option value="">All statuses</option>
              <option value="NOT_STARTED">Not started</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETE">Complete</option>
            </select>
            <select name="sort" defaultValue={filters.sort} className={dashboardSelectClass}>
              <option value="averageScore">Average score</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
            </select>
            <DashboardPrimaryBtn type="submit">Apply filters</DashboardPrimaryBtn>
          </form>
        </details>

        <form className="hidden items-center gap-3 lg:flex">
          <div className="relative flex-1">
            <Search aria-hidden size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
            <input
              type="text"
              name="q"
              defaultValue={filters.q}
              placeholder="Search by name"
              className={`${dashboardInputClass} pl-9`}
            />
          </div>
          <select name="category" defaultValue={filters.category ?? ""} className={`${dashboardSelectClass} w-48`}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select name="status" defaultValue={filters.status ?? ""} className={`${dashboardSelectClass} w-40`}>
            <option value="">All statuses</option>
            <option value="NOT_STARTED">Not started</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETE">Complete</option>
          </select>
          <select name="sort" defaultValue={filters.sort} className={`${dashboardSelectClass} w-44`}>
            <option value="averageScore">Average score</option>
            <option value="category">Category</option>
            <option value="status">Status</option>
          </select>
          <DashboardPrimaryBtn type="submit">Apply</DashboardPrimaryBtn>
        </form>
      </DashboardCard>

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<Star size={22} />}
            title="No applications match the filter"
            description="Change filters to see scoring results."
          />
        </DashboardCard>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/admin/scoring/${app.id}`} className="group block">
              <DashboardCard className="p-0 transition hover:border-[#7DC8EE] hover:shadow-[0_22px_60px_rgba(10,10,10,0.1)]">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.75fr)_180px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {scoringBadge(app.status)}
                      {app.rank ? <DashboardBadge tone="blue">Rank #{app.rank}</DashboardBadge> : null}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold normal-case tracking-[-0.02em] text-[#0A0A0A]">
                      {app.fullName}
                    </h2>
                    <p className="mt-1 truncate text-sm text-black/55">{app.email}</p>
                  </div>

                  <DashboardPanel>
                    <p className="text-sm font-semibold text-[#0A0A0A]">{app.awardName}</p>
                    <p className="mt-1 text-sm text-black/55">{app.categoryName}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                      {app.submittedJudgeCount}/{app.assignedJudgeCount} judges submitted
                    </p>
                  </DashboardPanel>

                  <div className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                        Average
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                        {app.averageScoreLabel}
                      </p>
                    </div>
                    <ArrowRight
                      aria-hidden
                      size={17}
                      className="text-black/45 transition group-hover:translate-x-0.5 group-hover:text-[#1673A5]"
                    />
                  </div>
                </div>
              </DashboardCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
