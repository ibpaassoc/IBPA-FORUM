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
              <p
                className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-ink-soft)]"
                style={{ fontFamily: "var(--font-ui-family)" }}
              >
                Active judge
              </p>
              <p
                className="mt-2 text-[1.4rem] font-light leading-tight text-[var(--color-ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {juryName}
              </p>
              {professionalTitle ? (
                <p
                  className="mt-1 text-[0.85rem] italic text-[var(--color-ink-soft)]"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {professionalTitle}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expertiseAreas.slice(0, 4).map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] px-2.5 py-0.5 text-[0.62rem] font-medium text-[var(--color-ink-soft)]"
                  style={{ fontFamily: "var(--font-ui-family)" }}
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <DashboardKpiBar value={completionPct} label="Completion" tone="dark" />
          </div>
        </DashboardAccentBlock>

        <div className="grid grid-cols-3 gap-3">
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
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/jury/dashboard/applications/${app.id}`} className="group block">
              <DashboardCard className="p-0 transition-all duration-200 hover:border-[#72a0c1]/40 hover:shadow-[0_12px_40px_rgba(114,160,193,0.14)]">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)_148px] lg:items-center">

                  {/* Award info */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {scoreStatusBadge(app.scoreStatus)}
                      <DashboardChip>{app.category.name}</DashboardChip>
                    </div>
                    <h2
                      className="mt-3 text-[clamp(1rem,1.6vw,1.3rem)] font-light leading-[1.12] tracking-[-0.01em]"
                      style={{ fontFamily: "var(--font-display)", color: "#030213" }}
                    >
                      {app.award.name}
                    </h2>
                    <p
                      className="mt-1 text-[0.8rem] italic"
                      style={{ fontFamily: "var(--font-accent)", color: "#46525a" }}
                    >
                      Submitted {formatAdminDate(app.submittedAt ?? app.createdAt)}
                    </p>
                  </div>

                  {/* Applicant panel */}
                  <DashboardPanel>
                    <div className="flex items-center gap-2" style={{ color: "#72a0c1" }}>
                      <UserRound aria-hidden size={14} />
                      <p
                        className="text-[0.6rem] font-semibold uppercase tracking-[0.14em]"
                        style={{ fontFamily: "var(--font-ui-family)" }}
                      >
                        Applicant
                      </p>
                    </div>
                    <p
                      className="mt-2 text-[0.9rem] font-light leading-tight"
                      style={{ fontFamily: "var(--font-display)", color: "#030213" }}
                    >
                      {app.fullName}
                    </p>
                    <p
                      className="mt-1 truncate text-[0.78rem]"
                      style={{ fontFamily: "var(--font-body)", color: "#46525a" }}
                    >
                      {app.email}
                    </p>
                    <p
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-white/82 px-2.5 py-1 text-[0.7rem]"
                      style={{ fontFamily: "var(--font-ui-family)", color: "#46525a" }}
                    >
                      <MapPin aria-hidden size={11} />
                      {app.city}, {app.country}
                    </p>
                  </DashboardPanel>

                  {/* Review CTA */}
                  <div className="flex items-center justify-between rounded-[14px] border border-[var(--border-soft)] bg-white/68 p-4 transition-colors group-hover:border-[var(--color-blue)]/35 group-hover:bg-[var(--color-blue-wash)]/60">
                    <div>
                      <div className="flex items-center gap-2" style={{ color: "#72a0c1" }}>
                        <PenSquare aria-hidden size={14} />
                        <p
                          className="text-[0.6rem] font-semibold uppercase tracking-[0.14em]"
                          style={{ fontFamily: "var(--font-ui-family)" }}
                        >
                          Review
                        </p>
                      </div>
                      <p
                        className="mt-1.5 text-[0.85rem] font-light"
                        style={{ fontFamily: "var(--font-display)", color: "#030213" }}
                      >
                        Open entry
                      </p>
                    </div>
                    <ArrowRight
                      aria-hidden
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                      style={{ color: "#72a0c1" }}
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
