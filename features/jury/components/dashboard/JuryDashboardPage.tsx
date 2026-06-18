"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, MapPin, PenSquare, UserRound } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardChip,
  DashboardEmptyState,
  DashboardFilterChip,
  DashboardKpiBar,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
} from "@/shared/components/admin/DashboardUI";

function scoreStatusBadge(status: "NOT_STARTED" | "DRAFT" | "SUBMITTED") {
  switch (status) {
    case "SUBMITTED":
      return <DashboardBadge tone="green">Scored</DashboardBadge>;
    case "DRAFT":
      return <DashboardBadge tone="amber">Draft saved</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">Not started</DashboardBadge>;
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
  const completionPct =
    totals.totalAssignedApplications > 0
      ? Math.round((totals.scoredApplications / totals.totalAssignedApplications) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Jury"
        title="Review queue"
        description="Assigned nomination tasks only. Open a card to review evidence and submit a score."
      />

      <div className="grid gap-3 xl:grid-cols-[1.15fr_1fr]">
        <DashboardAccentBlock>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                Active judge
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">{juryName}</p>
              {professionalTitle ? <p className="mt-1 text-sm text-white/65">{professionalTitle}</p> : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expertiseAreas.slice(0, 4).map((area) => (
                <span key={area} className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-medium text-white/70">
                  {area}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <DashboardKpiBar value={completionPct} label="Completion" tone="dark" />
          </div>
        </DashboardAccentBlock>

        <div className="grid gap-3 sm:grid-cols-3">
          <DashboardMetricTile label="Assigned" value={totals.totalAssignedApplications} />
          <DashboardMetricTile label="Scored" value={totals.scoredApplications} accent="green" />
          <DashboardMetricTile label="Remaining" value={totals.remainingApplications} accent="amber" />
        </div>
      </div>

      {expertiseAreas.length > 1 ? (
        <DashboardCard>
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
        </DashboardCard>
      ) : null}

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<ClipboardList size={22} />}
            title="No applications to review"
            description={activeCategory ? "Switch filters to see another category." : "No nominations are assigned yet."}
          />
        </DashboardCard>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/jury/dashboard/applications/${app.id}`} className="group block">
              <DashboardCard className="p-0 transition hover:border-[#7DC8EE] hover:shadow-[0_22px_60px_rgba(10,10,10,0.1)]">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)_160px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {scoreStatusBadge(app.scoreStatus)}
                      <DashboardChip>{app.category.name}</DashboardChip>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold normal-case tracking-[-0.02em] text-[#0A0A0A]">
                      {app.award.name}
                    </h2>
                    <p className="mt-1 text-sm text-black/55">
                      Submitted {formatAdminDate(app.submittedAt ?? app.createdAt)}
                    </p>
                  </div>

                  <DashboardPanel>
                    <div className="flex items-center gap-2 text-[#1673A5]">
                      <UserRound aria-hidden size={16} />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                        Applicant
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#0A0A0A]">{app.fullName}</p>
                    <p className="mt-1 truncate text-xs text-black/50">{app.email}</p>
                    <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-black/50">
                      <MapPin aria-hidden size={13} />
                      {app.city}, {app.country}
                    </p>
                  </DashboardPanel>

                  <div className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-4">
                    <div>
                      <div className="flex items-center gap-2 text-black/45">
                        <PenSquare aria-hidden size={15} />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                          Review
                        </p>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#0A0A0A]">Open</p>
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
