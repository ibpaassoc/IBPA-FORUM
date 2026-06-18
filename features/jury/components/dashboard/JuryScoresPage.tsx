"use client";

import { ArrowRight, CheckSquare, MapPin, ShieldCheck } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardBadge,
  DashboardCard,
  DashboardEmptyState,
} from "@/shared/components/admin/DashboardUI";

export default function JuryScoresPage({
  applications,
  juryName,
}: {
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
  juryName: string;
}) {
  return (
    <div className="space-y-6">
      <DashboardCard className="overflow-hidden border-[#10203B]/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,125,157,0.18),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f5f8fc_55%,#eef3f8_100%)] p-0">
        <div className="grid gap-6 px-6 py-6 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.85fr)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#4C7D9D]">
              Jury archive
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#10203B] md:text-4xl">
              Submitted scores, organized by nomination.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-[15px]">
              A premium review archive for completed decisions. Re-open any scored nomination to
              revisit the source materials and score context.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[28px] border border-[#10203B]/10 bg-[#10203B] p-5 text-white shadow-[0_18px_50px_rgba(16,32,59,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                Submitted by
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{juryName}</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {applications.length} scored nomination{applications.length === 1 ? "" : "s"} in
                your completed review archive.
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F1F8] text-[#4C7D9D]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">Review integrity</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Read-only final state
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
                  Final archive
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Submitted entries remain preserved here until an admin reopens a score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<CheckSquare size={22} />}
            title="No submitted scores yet"
            description="Your completed nomination scores will appear here once final review has been submitted."
          />
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <a key={app.id} href={`/jury/dashboard/applications/${app.id}`} className="group block">
              <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_55%,#f2f6fb_100%)] p-0 transition duration-300 hover:-translate-y-0.5 hover:border-[#4C7D9D]/30 hover:shadow-[0_24px_60px_rgba(16,32,59,0.12)]">
                <div className="grid gap-5 px-5 py-5 md:px-6 md:py-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.8fr)]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                          Final score
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#10203B]">
                          {app.award.name}
                        </h2>
                        <div className="mt-2 inline-flex rounded-full border border-[#4C7D9D]/20 bg-[#E9F1F8] px-3 py-1 text-xs font-medium text-[#4C7D9D]">
                          {app.category.name}
                        </div>
                      </div>
                      <DashboardBadge tone="green">Scored</DashboardBadge>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
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
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
                          Submitted
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {formatAdminDate(app.submittedAt ?? app.createdAt)}
                        </p>
                        <p className="text-sm leading-7 text-slate-500">
                          Open the detail view to revisit submitted evidence and your scoring state.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4 rounded-[28px] border border-[#10203B]/8 bg-[#10203B] px-5 py-5 text-white">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                        Score archive
                      </p>
                      <p className="mt-3 text-sm leading-7 text-white/72">
                        Final nomination decisions stay grouped here for fast audit and reference.
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-white/80 transition group-hover:translate-x-0.5"
                    />
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
