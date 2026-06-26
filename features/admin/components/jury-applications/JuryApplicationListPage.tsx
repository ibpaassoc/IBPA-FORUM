"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardChip,
  DashboardEmptyState,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
} from "@/shared/components/admin/DashboardUI";

function juryStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return <DashboardBadge tone="green">Active judge</DashboardBadge>;
    case "APPROVED":
      return <DashboardBadge tone="blue">Approved</DashboardBadge>;
    case "SUBMITTED":
      return <DashboardBadge tone="amber">Pending review</DashboardBadge>;
    case "REJECTED":
      return <DashboardBadge tone="red">Rejected</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

export default function JuryApplicationListPage({
  applications,
  totalCount,
  pendingCount,
  approvedCount,
  activeJudgeCount,
}: {
  applications: Array<{
    id: string;
    fullName: string;
    email: string;
    city: string;
    country: string;
    professionalTitle: string;
    expertiseAreas: string[];
    status: "SUBMITTED" | "ADDITIONAL_INFO_REQUIRED" | "APPROVED" | "REJECTED" | "PAID";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
    submittedAt: Date | null;
    paidAt: Date | null;
  }>;
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  activeJudgeCount: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Jury"
        title="Candidate review"
        description="Approve judges, track payment activation, and keep expertise coverage clear."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Total candidates
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{totalCount}</p>
        </DashboardAccentBlock>
        <DashboardMetricTile label="Pending review" value={pendingCount} accent="amber" />
        <DashboardMetricTile label="Approved" value={approvedCount} accent="blue" />
        <DashboardMetricTile label="Active judges" value={activeJudgeCount} accent="green" />
      </div>

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<Users size={22} />}
            title="No jury applications yet"
            description="Submitted candidates will appear here."
          />
        </DashboardCard>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/admin/jury-applications/${app.id}`}
              className="group block"
            >
              <DashboardCard className="p-0 transition hover:border-[rgba(114,160,193,0.34)] hover:shadow-[0_24px_64px_rgba(114,160,193,0.16)]">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)_170px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {juryStatusBadge(app.status)}
                    </div>
                    <h2 className="mt-3 font-[var(--font-title-family)] text-[1.55rem] font-light tracking-[-0.025em] text-[var(--color-ink)]">
                      {app.fullName}
                    </h2>
                    <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">{app.email}</p>
                    <p className="mt-3 inline-flex items-center gap-2 rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-2.5 py-1 text-xs text-[var(--color-ink-soft)]">
                      <MapPin aria-hidden size={13} />
                      {app.city}, {app.country}
                    </p>
                  </div>

                  <DashboardPanel>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{app.professionalTitle}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {app.expertiseAreas.slice(0, 4).map((area) => (
                        <DashboardChip key={area}>{area}</DashboardChip>
                      ))}
                      {app.expertiseAreas.length > 4 ? (
                        <DashboardChip>+{app.expertiseAreas.length - 4}</DashboardChip>
                      ) : null}
                    </div>
                  </DashboardPanel>

                  <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white p-4 lg:flex-col lg:items-start">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                        Last activity
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                        {formatAdminDate(app.paidAt ?? app.submittedAt)}
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
