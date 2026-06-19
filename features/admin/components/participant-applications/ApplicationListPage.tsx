"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  FileText,
  Layers3,
  MapPin,
  ReceiptText,
} from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardEmptyState,
  DashboardFilterChip,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
} from "@/shared/components/admin/DashboardUI";

function applicationBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return <DashboardBadge tone="green">Approved</DashboardBadge>;
    case "SUBMITTED":
      return <DashboardBadge tone="blue">Submitted</DashboardBadge>;
    case "UNDER_REVIEW":
      return <DashboardBadge tone="blue">Under review</DashboardBadge>;
    case "PAYMENT_PENDING":
      return <DashboardBadge tone="amber">Payment pending</DashboardBadge>;
    case "REJECTED":
      return <DashboardBadge tone="red">Rejected</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

function paymentBadge(status: string) {
  switch (status) {
    case "PAID":
      return <DashboardBadge tone="green">Paid</DashboardBadge>;
    case "PENDING":
      return <DashboardBadge tone="amber">Awaiting payment</DashboardBadge>;
    case "FAILED":
      return <DashboardBadge tone="red">Payment failed</DashboardBadge>;
    case "EXPIRED":
      return <DashboardBadge tone="neutral">Expired</DashboardBadge>;
    case "REFUNDED":
      return <DashboardBadge tone="blue">Refunded</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

const statusFilters = [
  { label: "All", href: "/admin/applications", status: undefined },
  { label: "Payment pending", href: "/admin/applications?status=PAYMENT_PENDING", status: "PAYMENT_PENDING" },
  { label: "Submitted", href: "/admin/applications?status=SUBMITTED", status: "SUBMITTED" },
  { label: "Under review", href: "/admin/applications?status=UNDER_REVIEW", status: "UNDER_REVIEW" },
  { label: "Approved", href: "/admin/applications?status=APPROVED", status: "APPROVED" },
  { label: "Rejected", href: "/admin/applications?status=REJECTED", status: "REJECTED" },
];

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
    nominationApplications: Array<{
      id: string;
      category: { name: string };
      award: { name: string };
    }>;
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
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Applications"
        title="Review queue"
        description="Participant submissions grouped by applicant, payment state, and nomination set."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(4,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
            In review system
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{totals.total}</p>
        </DashboardAccentBlock>
        <DashboardMetricTile label="Payment pending" value={totals.paymentPending} accent="amber" />
        <DashboardMetricTile label="Submitted" value={totals.submitted} accent="blue" />
        <DashboardMetricTile label="Under review" value={totals.underReview} accent="blue" />
        <DashboardMetricTile label="Approved" value={totals.approved} accent="green" />
      </div>

      <DashboardCard>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <DashboardFilterChip
              key={filter.label}
              href={filter.href}
              active={filter.status ? activeStatus === filter.status : !activeStatus}
            >
              {filter.label}
            </DashboardFilterChip>
          ))}
        </div>
      </DashboardCard>

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<FileText size={22} />}
            title="No applications found"
            description="Adjust the status filter to see another queue."
          />
        </DashboardCard>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => {
            const nominations =
              app.nominationApplications.length > 0
                ? app.nominationApplications
                : [{ id: app.id, category: app.category, award: app.award }];
            const previewNominations = nominations.slice(0, 3);
            const remainingNominationCount = nominations.length - previewNominations.length;

            return (
              <Link
                key={app.id}
                href={`/admin/applications/${app.id}`}
                className="group block"
              >
                <DashboardCard className="p-0 transition hover:border-[#7DC8EE] hover:shadow-[0_22px_60px_rgba(10,10,10,0.1)]">
                  <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.8fr)_minmax(180px,0.45fr)] lg:items-stretch">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {applicationBadge(app.status)}
                        {paymentBadge(app.paymentStatus)}
                      </div>
                      <h2 className="mt-3 text-xl font-semibold normal-case tracking-[-0.02em] text-[#0A0A0A]">
                        {app.fullName}
                      </h2>
                      <p className="mt-1 truncate text-sm text-black/55">{app.email}</p>
                      <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#FAFAFA] px-2.5 py-1 text-xs text-black/55">
                        <MapPin aria-hidden size={13} />
                        {app.city}, {app.country}
                      </p>
                    </div>

                    <DashboardPanel className="flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-[#1673A5]">
                          <Layers3 aria-hidden size={16} />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                            Nominations
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#0A0A0A]">
                          {nominations.length} selected
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {previewNominations.map((nomination) => (
                          <span
                            key={nomination.id}
                            className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs font-medium text-black/60"
                          >
                            {nomination.award.name}
                          </span>
                        ))}
                        {remainingNominationCount > 0 ? (
                          <span className="rounded-md border border-[#7DC8EE] bg-[#EAF6FF] px-2 py-1 text-xs font-semibold text-[#0A0A0A]">
                            +{remainingNominationCount}
                          </span>
                        ) : null}
                      </div>
                    </DashboardPanel>

                    <div className="flex flex-col justify-between gap-3 rounded-lg border border-black/10 bg-white p-4">
                      <div>
                        <div className="flex items-center gap-2 text-black/45">
                          <ReceiptText aria-hidden size={15} />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                            Primary path
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#0A0A0A]">
                          {app.award.name}
                        </p>
                        <p className="text-sm text-black/55">{app.category.name}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-black/45">
                          <Clock3 aria-hidden size={13} />
                          {formatAdminDate(app.createdAt)}
                        </span>
                        <ArrowRight
                          aria-hidden
                          size={17}
                          className="text-black/50 transition group-hover:translate-x-0.5 group-hover:text-[#1673A5]"
                        />
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
