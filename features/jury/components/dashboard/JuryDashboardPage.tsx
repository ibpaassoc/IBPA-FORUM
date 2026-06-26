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
  DashboardStagger,
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
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                Active judge
              </p>
              <p className="mt-2 font-[var(--font-title-family)] text-[1.4rem] font-light leading-tight text-[var(--color-ink)]">
                {juryName}
              </p>
              {professionalTitle ? (
                <p className="mt-1 font-[var(--font-accent-family)] text-[0.95rem] italic text-[var(--color-ink-soft)]">
                  {professionalTitle}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expertiseAreas.slice(0, 4).map((area) => (
                <DashboardChip key={area}>{area}</DashboardChip>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <DashboardKpiBar value={completionPct} label="Completion" tone="dark" />
          </div>
        </DashboardAccentBlock>

        <DashboardStagger className="grid grid-cols-3 gap-3">
          <DashboardMetricTile label="Assigned" value={totals.totalAssignedApplications} />
          <DashboardMetricTile label="Scored" value={totals.scoredApplications} accent="green" />
          <DashboardMetricTile label="Remaining" value={totals.remainingApplications} accent="amber" />
        </DashboardStagger>
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
            icon={<ClipboardList size={20} />}
            title="No applications to review"
            description={
              activeCategory
                ? "Switch filters to see another category."
                : "No nominations are assigned yet."
            }
          />
        </DashboardCard>
      ) : (
        <DashboardStagger className="flex flex-col gap-3" stagger={0.05}>
          {applications.map((app) => (
            <Link key={app.id} href={`/jury/dashboard/applications/${app.id}`} className="group block">
              <DashboardCard className="p-0 transition-all duration-200 hover:border-[rgba(114,160,193,0.4)] hover:shadow-[0_18px_48px_rgba(114,160,193,0.16)]">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)_148px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {scoreStatusBadge(app.scoreStatus)}
                      <DashboardChip>{app.category.name}</DashboardChip>
                    </div>
                    <h2 className="mt-3 font-[var(--font-title-family)] text-[1.45rem] font-light leading-tight tracking-[-0.025em] text-[var(--color-ink)]">
                      {app.award.name}
                    </h2>
                    <p className="mt-1 font-[var(--font-accent-family)] text-[0.95rem] italic text-[var(--color-ink-soft)]">
                      Submitted {formatAdminDate(app.submittedAt ?? app.createdAt)}
                    </p>
                  </div>

                  <DashboardPanel>
                    <div className="flex items-center gap-2 text-[var(--color-blue)]">
                      <UserRound aria-hidden size={14} />
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em]">
                        Applicant
                      </p>
                    </div>
                    <p className="mt-2 font-[var(--font-title-family)] text-[1.1rem] font-light leading-tight text-[var(--color-ink)]">
                      {app.fullName}
                    </p>
                    <p className="mt-1 truncate text-[0.78rem] text-[var(--color-ink-soft)]">
                      {app.email}
                    </p>
                    <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-[18px] border border-[var(--border-soft)] bg-white/82 px-2.5 py-1 text-[0.7rem] text-[var(--color-ink-soft)]">
                      <MapPin aria-hidden size={11} />
                      {app.city}, {app.country}
                    </p>
                  </DashboardPanel>

                  <div className="flex items-center justify-between rounded-[22px] border border-[var(--border-soft)] bg-white/68 p-4 transition-colors group-hover:border-[var(--color-blue)]/35 group-hover:bg-[var(--color-blue-wash)]/60">
                    <div>
                      <div className="flex items-center gap-2 text-[var(--color-blue)]">
                        <PenSquare aria-hidden size={14} />
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em]">
                          Review
                        </p>
                      </div>
                      <p className="mt-1.5 font-[var(--font-title-family)] text-[1rem] font-light text-[var(--color-ink)]">
                        Open entry
                      </p>
                    </div>
                    <ArrowRight
                      aria-hidden
                      size={16}
                      className="text-[var(--color-blue)] transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              </DashboardCard>
            </Link>
          ))}
        </DashboardStagger>
      )}
    </div>
  );
}
