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
      <DashboardPageHeader label="Scores" title="Submitted archive" />

      <DashboardAccentBlock>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
              Submitted by
            </p>
            <p className="mt-1.5 font-[var(--font-title-family)] text-[1.4rem] font-light leading-tight text-[var(--color-ink)]">
              {juryName}
            </p>
          </div>
          <div className="rounded-[22px] border border-[var(--color-blue-soft)] bg-white/72 px-5 py-3 shadow-[0_10px_24px_rgba(114,160,193,0.1)]">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
              Completed
            </p>
            <p className="mt-1 font-[var(--font-title-family)] text-[1.8rem] font-light leading-none text-[var(--color-ink)]">
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
            <Link key={app.id} href={`/account/jury/nominations/${app.id}`} className="group block">
              <DashboardCard className="p-0 transition-all duration-200 hover:border-[rgba(114,160,193,0.4)] hover:shadow-[0_18px_48px_rgba(114,160,193,0.16)]">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)_148px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DashboardBadge tone="green">Scored</DashboardBadge>
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
                        <ShieldCheck aria-hidden size={14} />
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em]">
                          Archive
                        </p>
                      </div>
                      <p className="mt-1.5 font-[var(--font-title-family)] text-[1rem] font-light text-[var(--color-ink)]">
                        View score
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
        </div>
      )}
    </div>
  );
}
