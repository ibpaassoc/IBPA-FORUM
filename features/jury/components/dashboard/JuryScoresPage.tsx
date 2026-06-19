"use client";

import Link from "next/link";
import { ArrowRight, CheckSquare, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardChip,
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardPanel,
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
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Scores"
        title="Submitted archive"
        description="Final nomination scores you have already submitted."
      />

      <DashboardAccentBlock>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="text-[0.65rem] uppercase tracking-[0.18em] text-white/75"
              style={{ fontFamily: "var(--font-ui-family)" }}
            >
              Submitted by
            </p>
            <p
              className="mt-1.5 text-[1.4rem] font-light leading-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {juryName}
            </p>
          </div>
          <div className="rounded-[10px] border border-white/20 bg-white/12 px-5 py-3">
            <p
              className="text-[0.62rem] uppercase tracking-[0.16em] text-white/70"
              style={{ fontFamily: "var(--font-ui-family)" }}
            >
              Completed
            </p>
            <p
              className="mt-1 text-[1.8rem] font-light leading-none text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {applications.length}
            </p>
          </div>
        </div>
      </DashboardAccentBlock>

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<CheckSquare size={20} />}
            title="No submitted scores yet"
            description="Submitted nomination scores will appear here."
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
                      <DashboardBadge tone="green">Scored</DashboardBadge>
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
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[0.7rem]"
                      style={{ fontFamily: "var(--font-ui-family)", color: "#46525a" }}
                    >
                      <MapPin aria-hidden size={11} />
                      {app.city}, {app.country}
                    </p>
                  </DashboardPanel>

                  {/* Archive CTA */}
                  <div className="flex items-center justify-between rounded-[10px] border border-black/[0.07] bg-[#fafaf9] p-4 transition-colors group-hover:border-[#72a0c1]/30 group-hover:bg-[#f2f8fb]/60">
                    <div>
                      <div className="flex items-center gap-2" style={{ color: "#72a0c1" }}>
                        <ShieldCheck aria-hidden size={14} />
                        <p
                          className="text-[0.6rem] font-semibold uppercase tracking-[0.14em]"
                          style={{ fontFamily: "var(--font-ui-family)" }}
                        >
                          Archive
                        </p>
                      </div>
                      <p
                        className="mt-1.5 text-[0.85rem] font-light"
                        style={{ fontFamily: "var(--font-display)", color: "#030213" }}
                      >
                        View score
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
