"use client";

import { FileText } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardCard,
  DashboardMetricTile,
  DashboardSectionHeader,
  DashboardFilterChip,
  DashboardTable,
  DashboardTableRow,
  DashboardBadge,
  DashboardEmptyState,
} from "@/shared/components/admin/DashboardUI";

function applicationBadge(status: string) {
  switch (status) {
    case "APPROVED": return <DashboardBadge tone="green">Approved</DashboardBadge>;
    case "SUBMITTED": return <DashboardBadge tone="blue">Submitted</DashboardBadge>;
    case "UNDER_REVIEW": return <DashboardBadge tone="purple">Under review</DashboardBadge>;
    case "PAYMENT_PENDING": return <DashboardBadge tone="amber">Payment pending</DashboardBadge>;
    case "REJECTED": return <DashboardBadge tone="red">Rejected</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

export default function ApplicationListPage({
  applications,
  activeStatus,
  totals,
}: {
  applications: Array<{
    id: string;
    fullName: string;
    email: string;
    city: string;
    country: string;
    status: "DRAFT" | "PAYMENT_PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
    createdAt: Date;
    category: { name: string };
    award: { name: string };
  }>;
  activeStatus?: string;
  totals: {
    total: number;
    paymentPending: number;
    submitted: number;
    underReview: number;
    approved: number;
  };
}) {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B] md:text-3xl">
          Participant Applications
        </h1>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <DashboardMetricTile label="Total" value={totals.total} />
        <DashboardMetricTile label="Payment pending" value={totals.paymentPending} accent="amber" />
        <DashboardMetricTile label="Submitted" value={totals.submitted} accent="blue" />
        <DashboardMetricTile label="Under review" value={totals.underReview} accent="blue" />
        <DashboardMetricTile label="Approved" value={totals.approved} accent="green" />
      </div>

      {/* Filter + table */}
      <DashboardCard className="p-0 overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4 md:p-5">
          {[
            { label: "All", href: "/admin/applications", active: !activeStatus },
            { label: "Payment pending", href: "/admin/applications?status=PAYMENT_PENDING", active: activeStatus === "PAYMENT_PENDING" },
            { label: "Submitted", href: "/admin/applications?status=SUBMITTED", active: activeStatus === "SUBMITTED" },
            { label: "Under review", href: "/admin/applications?status=UNDER_REVIEW", active: activeStatus === "UNDER_REVIEW" },
            { label: "Approved", href: "/admin/applications?status=APPROVED", active: activeStatus === "APPROVED" },
            { label: "Rejected", href: "/admin/applications?status=REJECTED", active: activeStatus === "REJECTED" },
          ].map((f) => (
            <DashboardFilterChip key={f.label} href={f.href} active={f.active}>
              {f.label}
            </DashboardFilterChip>
          ))}
        </div>

        {applications.length === 0 ? (
          <div className="p-6">
            <DashboardEmptyState
              icon={<FileText size={22} />}
              title="No applications found"
              description="Try adjusting the filter above."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <a
                key={app.id}
                href={`/admin/applications/${app.id}`}
                className="grid gap-2 px-4 py-4 transition-colors hover:bg-slate-50/80 md:grid-cols-[1.4fr_1fr_1fr_auto_auto]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">{app.fullName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{app.email}</p>
                  <p className="text-xs text-slate-400">{app.city}, {app.country}</p>
                </div>
                <div className="flex items-start pt-0.5">
                  <p className="text-sm text-[#10203B]">{app.category.name}</p>
                </div>
                <div className="flex items-start pt-0.5">
                  <p className="text-sm text-slate-600">{app.award.name}</p>
                </div>
                <div className="flex items-start pt-0.5">
                  {applicationBadge(app.status)}
                </div>
                <div className="flex items-start pt-0.5">
                  <p className="text-xs text-slate-400">{formatAdminDate(app.createdAt)}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
