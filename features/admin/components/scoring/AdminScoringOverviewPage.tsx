"use client";

import Link from "next/link";
import { ArrowRight, Search, Star } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardEmptyState,
  DashboardKpiBar,
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
      return <DashboardBadge tone="green">{adminT.statuses.COMPLETE}</DashboardBadge>;
    case "IN_PROGRESS":
      return <DashboardBadge tone="amber">{adminT.statuses.IN_PROGRESS}</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">{adminT.statuses.NOT_STARTED}</DashboardBadge>;
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
      <DashboardPageHeader label={adminT.scoring.label} title={adminT.scoring.title} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            {adminT.scoring.scoreable}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
            {stats.totalScoreableApplications}
          </p>
        </DashboardAccentBlock>
        <DashboardMetricTile label={adminT.scoring.scored} value={stats.totalScoredApplications} accent="green" />
        <DashboardMetricTile label={adminT.scoring.notScored} value={stats.totalNotScoredApplications} accent="amber" />
        <DashboardMetricTile
          label={adminT.scoring.avgCompletion}
          value={`${stats.averageCompletionPercentage.toFixed(0)}%`}
          accent="blue"
        />
      </div>

      <DashboardCard>
        <details className="group lg:hidden">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-3 text-sm font-medium text-[var(--color-ink)]">
            <span>{adminT.filters.toggle}</span>
            <span className="text-[var(--color-ink-muted)] transition group-open:rotate-180">v</span>
          </summary>
          <form className="mt-3 grid gap-2">
            <input type="text" name="q" defaultValue={filters.q} placeholder={adminT.scoring.searchPlaceholder} className={dashboardInputClass} />
            <select name="category" defaultValue={filters.category ?? ""} className={dashboardSelectClass}>
              <option value="">{adminT.filters.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select name="status" defaultValue={filters.status ?? ""} className={dashboardSelectClass}>
              <option value="">{adminT.filters.allStatuses}</option>
              <option value="NOT_STARTED">{adminT.statuses.NOT_STARTED}</option>
              <option value="IN_PROGRESS">{adminT.statuses.IN_PROGRESS}</option>
              <option value="COMPLETE">{adminT.statuses.COMPLETE}</option>
            </select>
            <select name="sort" defaultValue={filters.sort} className={dashboardSelectClass}>
              <option value="averageScore">{adminT.scoring.sortAverage}</option>
              <option value="category">{adminT.scoring.sortCategory}</option>
              <option value="status">{adminT.scoring.sortStatus}</option>
            </select>
            <DashboardPrimaryBtn type="submit">{adminT.filters.apply}</DashboardPrimaryBtn>
          </form>
        </details>

        <form className="hidden items-center gap-3 lg:flex">
          <div className="relative flex-1">
            <Search aria-hidden size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
            <input
              type="text"
              name="q"
              defaultValue={filters.q}
              placeholder={adminT.scoring.searchPlaceholder}
              className={`${dashboardInputClass} pl-9`}
            />
          </div>
          <select name="category" defaultValue={filters.category ?? ""} className={`${dashboardSelectClass} w-48`}>
            <option value="">{adminT.filters.allCategories}</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select name="status" defaultValue={filters.status ?? ""} className={`${dashboardSelectClass} w-40`}>
            <option value="">{adminT.filters.allStatuses}</option>
            <option value="NOT_STARTED">{adminT.statuses.NOT_STARTED}</option>
            <option value="IN_PROGRESS">{adminT.statuses.IN_PROGRESS}</option>
            <option value="COMPLETE">{adminT.statuses.COMPLETE}</option>
          </select>
          <select name="sort" defaultValue={filters.sort} className={`${dashboardSelectClass} w-44`}>
            <option value="averageScore">{adminT.scoring.sortAverage}</option>
            <option value="category">{adminT.scoring.sortCategory}</option>
            <option value="status">{adminT.scoring.sortStatus}</option>
          </select>
          <DashboardPrimaryBtn type="submit">{adminT.filters.apply}</DashboardPrimaryBtn>
        </form>
      </DashboardCard>

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<Star size={22} />}
            title={adminT.scoring.emptyTitle}
            description={adminT.scoring.emptyText}
          />
        </DashboardCard>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/admin/scoring/${app.id}`} className="group block">
              <DashboardCard className="p-0 transition hover:border-[rgba(114,160,193,0.34)] hover:shadow-[0_24px_64px_rgba(114,160,193,0.16)]">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.75fr)_180px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {scoringBadge(app.status)}
                      {app.rank ? <DashboardBadge tone="blue">{adminT.scoring.rank} #{app.rank}</DashboardBadge> : null}
                    </div>
                    <h2 className="mt-3 font-[var(--font-title-family)] text-[1.55rem] font-light tracking-[-0.025em] text-[var(--color-ink)]">
                      {app.fullName}
                    </h2>
                    <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">{app.email}</p>
                  </div>

                  <DashboardPanel>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{app.awardName}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{app.categoryName}</p>
                    <div className="mt-3">
                      <DashboardKpiBar
                        value={
                          app.assignedJudgeCount
                            ? Math.round(
                                (app.submittedJudgeCount / app.assignedJudgeCount) * 100,
                              )
                            : 0
                        }
                        label={`${adminT.scoring.judgesLabel} ${app.submittedJudgeCount}/${app.assignedJudgeCount}`}
                      />
                    </div>
                  </DashboardPanel>

                  <div className="flex items-center justify-between rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white p-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                        {adminT.scoring.average}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                        {app.averageScoreLabel}
                      </p>
                    </div>
                    <ArrowRight
                      aria-hidden
                      size={17}
                      className="text-[var(--color-ink-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-blue)]"
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
