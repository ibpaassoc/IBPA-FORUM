"use client";

import { Star } from "lucide-react";
import {
  DashboardCard,
  DashboardMetricTile,
  DashboardBadge,
  DashboardEmptyState,
  dashboardInputClass,
  dashboardSelectClass,
  DashboardPrimaryBtn,
} from "@/shared/components/admin/DashboardUI";

function scoringBadge(status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE") {
  switch (status) {
    case "COMPLETE": return <DashboardBadge tone="green">Complete</DashboardBadge>;
    case "IN_PROGRESS": return <DashboardBadge tone="amber">In progress</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">Not started</DashboardBadge>;
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
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B] md:text-3xl">
          Scoring Overview
        </h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardMetricTile label="Scoreable" value={stats.totalScoreableApplications} />
        <DashboardMetricTile label="Scored" value={stats.totalScoredApplications} accent="green" />
        <DashboardMetricTile label="Not scored" value={stats.totalNotScoredApplications} accent="amber" />
        <DashboardMetricTile label="Avg completion" value={`${stats.averageCompletionPercentage.toFixed(0)}%`} accent="blue" />
      </div>

      {/* Filters */}
      <DashboardCard>
        {/* Mobile collapsible */}
        <details className="group lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#10203B]">
            <span>Filters</span>
            <span className="text-slate-400 transition group-open:rotate-180">▾</span>
          </summary>
          <form className="mt-3 grid gap-2">
            <input type="text" name="q" defaultValue={filters.q} placeholder="Search by name" className={dashboardInputClass} />
            <select name="category" defaultValue={filters.category ?? ""} className={dashboardSelectClass}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select name="status" defaultValue={filters.status ?? ""} className={dashboardSelectClass}>
              <option value="">All statuses</option>
              <option value="NOT_STARTED">Not started</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETE">Complete</option>
            </select>
            <select name="sort" defaultValue={filters.sort} className={dashboardSelectClass}>
              <option value="averageScore">Sort: Average score</option>
              <option value="category">Sort: Category</option>
              <option value="status">Sort: Status</option>
            </select>
            <DashboardPrimaryBtn type="submit">Apply filters</DashboardPrimaryBtn>
          </form>
        </details>

        {/* Desktop inline */}
        <form className="hidden items-center gap-3 lg:flex">
          <input type="text" name="q" defaultValue={filters.q} placeholder="Search by name" className={`${dashboardInputClass} flex-1`} />
          <select name="category" defaultValue={filters.category ?? ""} className={`${dashboardSelectClass} w-44`}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="status" defaultValue={filters.status ?? ""} className={`${dashboardSelectClass} w-36`}>
            <option value="">All statuses</option>
            <option value="NOT_STARTED">Not started</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETE">Complete</option>
          </select>
          <select name="sort" defaultValue={filters.sort} className={`${dashboardSelectClass} w-44`}>
            <option value="averageScore">Avg score</option>
            <option value="category">Category</option>
            <option value="status">Status</option>
          </select>
          <DashboardPrimaryBtn type="submit">Apply</DashboardPrimaryBtn>
        </form>
      </DashboardCard>

      {/* Results */}
      <DashboardCard className="p-0 overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-6">
            <DashboardEmptyState
              icon={<Star size={22} />}
              title="No applications match the filter"
              description="Adjust the filters above to see scoring results."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="hidden grid-cols-[1.6fr_0.9fr_1.2fr_0.6fr_auto] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4C7D9D] lg:grid">
              <span>Participant</span>
              <span>Category</span>
              <span>Nomination</span>
              <span>Average</span>
              <span>Status</span>
            </div>
            {applications.map((app) => (
              <a
                key={app.id}
                href={`/admin/scoring/${app.id}`}
                className="grid gap-2 px-4 py-4 transition-colors hover:bg-slate-50/80 lg:grid-cols-[1.6fr_0.9fr_1.2fr_0.6fr_auto] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">{app.fullName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{app.email}</p>
                </div>
                <p className="text-sm text-slate-600">{app.categoryName}</p>
                <p className="text-sm text-slate-600">{app.awardName}</p>
                <p className="text-sm font-semibold text-[#10203B]">{app.averageScoreLabel}</p>
                <div>{scoringBadge(app.status)}</div>
              </a>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
