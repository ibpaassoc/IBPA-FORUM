"use client";

import { Users } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardCard,
  DashboardMetricTile,
  DashboardBadge,
  DashboardChip,
  DashboardEmptyState,
} from "@/shared/components/admin/DashboardUI";

function juryStatusBadge(status: string) {
  switch (status) {
    case "PAID": return <DashboardBadge tone="green">Active judge</DashboardBadge>;
    case "APPROVED": return <DashboardBadge tone="blue">Approved</DashboardBadge>;
    case "SUBMITTED": return <DashboardBadge tone="amber">Pending review</DashboardBadge>;
    case "REJECTED": return <DashboardBadge tone="red">Rejected</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
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
    status: "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";
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
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B] md:text-3xl">
          Jury Applications
        </h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardMetricTile label="Total" value={totalCount} />
        <DashboardMetricTile label="Pending review" value={pendingCount} accent="amber" />
        <DashboardMetricTile label="Approved" value={approvedCount} accent="blue" />
        <DashboardMetricTile label="Active judges" value={activeJudgeCount} accent="green" />
      </div>

      {/* Table */}
      <DashboardCard className="p-0 overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-6">
            <DashboardEmptyState
              icon={<Users size={22} />}
              title="No jury applications yet"
              description="Jury applications will appear here once submitted."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Header row */}
            <div className="hidden grid-cols-[1.4fr_0.8fr_1fr_auto_auto] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4C7D9D] lg:grid">
              <span>Candidate</span>
              <span>Title</span>
              <span>Expertise</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {applications.map((app) => (
              <a
                key={app.id}
                href={`/admin/jury-applications/${app.id}`}
                className="grid gap-2 px-4 py-4 transition-colors hover:bg-slate-50/80 lg:grid-cols-[1.4fr_0.8fr_1fr_auto_auto] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">{app.fullName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{app.email}</p>
                  <p className="text-xs text-slate-400">{app.city}, {app.country}</p>
                </div>
                <p className="text-sm text-slate-600">{app.professionalTitle}</p>
                <div className="flex flex-wrap gap-1">
                  {app.expertiseAreas.slice(0, 3).map((area) => (
                    <DashboardChip key={area}>{area}</DashboardChip>
                  ))}
                  {app.expertiseAreas.length > 3 && (
                    <DashboardChip>+{app.expertiseAreas.length - 3}</DashboardChip>
                  )}
                </div>
                <div>{juryStatusBadge(app.status)}</div>
                <p className="text-xs text-slate-400">
                  {formatAdminDate(app.paidAt ?? app.submittedAt)}
                </p>
              </a>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
