"use client";

import { ClipboardList } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardCard,
  DashboardMetricTile,
  DashboardFilterChip,
  DashboardBadge,
  DashboardEmptyState,
  DashboardChip,
} from "@/shared/components/admin/DashboardUI";

function scoreStatusBadge(status: "NOT_STARTED" | "DRAFT" | "SUBMITTED") {
  switch (status) {
    case "SUBMITTED": return <DashboardBadge tone="green">Scored</DashboardBadge>;
    case "DRAFT": return <DashboardBadge tone="amber">Draft saved</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">Not started</DashboardBadge>;
  }
}

export default function JuryDashboardPage({
  juryName,
  professionalTitle,
  expertiseAreas,
  applications,
  activeCategory,
  totals,
}: {
  juryName: string;
  professionalTitle: string;
  expertiseAreas: string[];
  applications: Array<{
    id: string;
    fullName: string;
    email: string;
    city: string;
    country: string;
    createdAt: Date;
    submittedAt: Date | null;
    category: { name: string };
    award: { name: string };
    scoreStatus: "NOT_STARTED" | "DRAFT" | "SUBMITTED";
    scoreId: string | null;
  }>;
  activeCategory?: string;
  totals: {
    totalAssignedApplications: number;
    scoredApplications: number;
    remainingApplications: number;
    categories: number;
  };
}) {
  const completionPct = totals.totalAssignedApplications > 0
    ? Math.round((totals.scoredApplications / totals.totalAssignedApplications) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
          Jury Panel
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B] md:text-3xl">
          Review Applications
        </h1>
        {professionalTitle && (
          <p className="mt-1 text-sm text-slate-500">{professionalTitle}</p>
        )}
      </div>

      {/* Expertise areas */}
      {expertiseAreas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {expertiseAreas.map((area) => (
            <DashboardChip key={area}>{area}</DashboardChip>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardMetricTile label="Assigned" value={totals.totalAssignedApplications} />
        <DashboardMetricTile label="Scored" value={totals.scoredApplications} accent="green" />
        <DashboardMetricTile label="Remaining" value={totals.remainingApplications} accent="amber" />
        <DashboardMetricTile label="Completion" value={`${completionPct}%`} accent={completionPct === 100 ? "green" : "blue"} />
      </div>

      {/* Category filters */}
      {expertiseAreas.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <DashboardFilterChip href="/jury/dashboard" active={!activeCategory}>
            All categories
          </DashboardFilterChip>
          {expertiseAreas.map((area) => (
            <DashboardFilterChip
              key={area}
              href={`/jury/dashboard?category=${encodeURIComponent(area)}`}
              active={activeCategory === area}
            >
              {area}
            </DashboardFilterChip>
          ))}
        </div>
      )}

      {/* Applications table */}
      <DashboardCard className="p-0 overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-6">
            <DashboardEmptyState
              icon={<ClipboardList size={22} />}
              title="No applications to review"
              description={activeCategory ? "Try switching to a different category." : "You have no assigned applications yet."}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="hidden grid-cols-[1.4fr_0.9fr_1fr_auto_auto] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4C7D9D] lg:grid">
              <span>Applicant</span>
              <span>Category</span>
              <span>Nomination</span>
              <span>Score status</span>
              <span>Submitted</span>
            </div>
            {applications.map((app) => (
              <a
                key={app.id}
                href={`/jury/dashboard/applications/${app.id}`}
                className="grid gap-2 px-4 py-4 transition-colors hover:bg-slate-50/80 lg:grid-cols-[1.4fr_0.9fr_1fr_auto_auto] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">{app.fullName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{app.email}</p>
                  <p className="text-xs text-slate-400">{app.city}, {app.country}</p>
                </div>
                <p className="text-sm text-slate-600">{app.category.name}</p>
                <p className="text-sm text-slate-600">{app.award.name}</p>
                <div>{scoreStatusBadge(app.scoreStatus)}</div>
                <p className="text-xs text-slate-400">{formatAdminDate(app.submittedAt ?? app.createdAt)}</p>
              </a>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
