"use client";

import {
  ArrowRight,
  ClipboardList,
  Compass,
  MapPin,
  PenSquare,
  Sparkles,
} from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardBadge,
  DashboardCard,
  DashboardChip,
  DashboardEmptyState,
  DashboardFilterChip,
  DashboardMetricTile,
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
    <div className="space-y-6">
      <DashboardCard className="overflow-hidden border-[#10203B]/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,125,157,0.18),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f5f8fc_55%,#eef3f8_100%)] p-0">
        <div className="grid gap-6 px-6 py-6 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.95fr)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#4C7D9D]">
              Jury review
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#10203B] md:text-4xl">
              Focused review queue for nomination scoring.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-[15px]">
              Every card below is a nomination-specific review task. Work through the queue,
              preserve scoring quality, and keep your submitted decisions tightly organized.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {expertiseAreas.map((area) => (
                <DashboardChip key={area}>{area}</DashboardChip>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[28px] border border-[#10203B]/10 bg-[#10203B] p-5 text-white shadow-[0_18px_50px_rgba(16,32,59,0.16)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                    Active jury desk
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                    {juryName}
                  </p>
                  {professionalTitle ? (
                    <p className="mt-1 text-sm text-white/65">{professionalTitle}</p>
                  ) : null}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Sparkles size={18} />
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  <span>Completion</span>
                  <span>{completionPct}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-[#8BB7D3]"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F1F8] text-[#4C7D9D]">
                  <Compass size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">Current focus</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Nomination-only workflow
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DashboardMetricTile label="Assigned" value={totals.totalAssignedApplications} />
                <DashboardMetricTile label="Remaining" value={totals.remainingApplications} accent="amber" />
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardMetricTile label="Assigned" value={totals.totalAssignedApplications} />
        <DashboardMetricTile label="Scored" value={totals.scoredApplications} accent="green" />
        <DashboardMetricTile label="Remaining" value={totals.remainingApplications} accent="amber" />
        <DashboardMetricTile
          label="Completion"
          value={`${completionPct}%`}
          accent={completionPct === 100 ? "green" : "blue"}
        />
      </div>

      {expertiseAreas.length > 1 ? (
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
      ) : null}

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<ClipboardList size={22} />}
            title="No applications to review"
            description={
              activeCategory
                ? "Switch filters to reveal a different nomination category."
                : "You do not have assigned nominations yet."
            }
          />
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <a key={app.id} href={`/jury/dashboard/applications/${app.id}`} className="group block">
              <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_55%,#f2f6fb_100%)] p-0 transition duration-300 hover:-translate-y-0.5 hover:border-[#4C7D9D]/30 hover:shadow-[0_24px_60px_rgba(16,32,59,0.12)]">
                <div className="grid gap-5 px-5 py-5 md:px-6 md:py-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                          Nomination review
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#10203B]">
                          {app.award.name}
                        </h2>
                        <div className="mt-2 inline-flex rounded-full border border-[#4C7D9D]/20 bg-[#E9F1F8] px-3 py-1 text-xs font-medium text-[#4C7D9D]">
                          {app.category.name}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {scoreStatusBadge(app.scoreStatus)}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                      <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
                          Applicant
                        </p>
                        <p className="mt-3 text-lg font-semibold text-[#10203B]">{app.fullName}</p>
                        <p className="mt-1 text-sm text-slate-500">{app.email}</p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                          <MapPin size={13} />
                          {app.city}, {app.country}
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex items-center gap-2 text-[#4C7D9D]">
                          <PenSquare size={16} />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                            Review timing
                          </p>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          Submitted {formatAdminDate(app.submittedAt ?? app.createdAt)}
                        </p>
                        <p className="text-sm leading-7 text-slate-500">
                          Open the application to review materials and score this nomination.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-[#10203B]/8 bg-[#10203B] px-5 py-5 text-white">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                        Queue note
                      </p>
                      <p className="mt-3 text-sm leading-7 text-white/72">
                        Each application card opens a nomination-specific scoring workspace with
                        files, applicant context, and final scoring controls.
                      </p>
                    </div>
                    <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                          Enter review
                        </p>
                        <p className="mt-1 text-sm text-white/72">Continue evaluation</p>
                      </div>
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-white/80 transition group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
