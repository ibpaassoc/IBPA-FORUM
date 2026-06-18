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
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Submitted by
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">{juryName}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Completed
            </p>
            <p className="mt-1 text-2xl font-semibold">{applications.length}</p>
          </div>
        </div>
      </DashboardAccentBlock>

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<CheckSquare size={22} />}
            title="No submitted scores yet"
            description="Submitted nomination scores will appear here."
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
                      <DashboardBadge tone="green">Scored</DashboardBadge>
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
                        <ShieldCheck aria-hidden size={15} />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                          Archive
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
