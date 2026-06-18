"use client";

import {
  ArrowRight,
  Clock3,
  FileText,
  Layers3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardBadge,
  DashboardCard,
  DashboardEmptyState,
  DashboardFilterChip,
  DashboardMetricTile,
} from "@/shared/components/admin/DashboardUI";

function applicationBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return <DashboardBadge tone="green">Approved</DashboardBadge>;
    case "SUBMITTED":
      return <DashboardBadge tone="blue">Submitted</DashboardBadge>;
    case "UNDER_REVIEW":
      return <DashboardBadge tone="purple">Under review</DashboardBadge>;
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
    <div className="space-y-6">
      <DashboardCard className="overflow-hidden border-[#10203B]/10 bg-[radial-gradient(circle_at_top_left,_rgba(76,125,157,0.16),_transparent_38%),linear-gradient(135deg,#ffffff_0%,#f5f8fc_52%,#edf2f8_100%)] p-0">
        <div className="grid gap-6 px-6 py-6 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#4C7D9D]">
              Admin applications
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-[#10203B] md:text-4xl">
              Premium review workspace for participant submissions.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-[15px]">
              Scan submission health, payment readiness, and nomination spread without opening each
              file. This view is scoped only to participant applications.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { label: "All", href: "/admin/applications", active: !activeStatus },
                {
                  label: "Payment pending",
                  href: "/admin/applications?status=PAYMENT_PENDING",
                  active: activeStatus === "PAYMENT_PENDING",
                },
                {
                  label: "Submitted",
                  href: "/admin/applications?status=SUBMITTED",
                  active: activeStatus === "SUBMITTED",
                },
                {
                  label: "Under review",
                  href: "/admin/applications?status=UNDER_REVIEW",
                  active: activeStatus === "UNDER_REVIEW",
                },
                {
                  label: "Approved",
                  href: "/admin/applications?status=APPROVED",
                  active: activeStatus === "APPROVED",
                },
                {
                  label: "Rejected",
                  href: "/admin/applications?status=REJECTED",
                  active: activeStatus === "REJECTED",
                },
              ].map((filter) => (
                <DashboardFilterChip
                  key={filter.label}
                  href={filter.href}
                  active={filter.active}
                >
                  {filter.label}
                </DashboardFilterChip>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[28px] border border-[#10203B]/10 bg-[#10203B] p-5 text-white shadow-[0_18px_50px_rgba(16,32,59,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                Live focus
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                {totals.total}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Applications currently flowing through the participant awards pipeline.
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F1F8] text-[#4C7D9D]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">Premium triage</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Application-only surface
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <DashboardMetricTile label="Submitted" value={totals.submitted} accent="blue" />
                <DashboardMetricTile label="Approved" value={totals.approved} accent="green" />
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <DashboardMetricTile label="Total" value={totals.total} />
        <DashboardMetricTile label="Payment pending" value={totals.paymentPending} accent="amber" />
        <DashboardMetricTile label="Submitted" value={totals.submitted} accent="blue" />
        <DashboardMetricTile label="Under review" value={totals.underReview} accent="blue" />
        <DashboardMetricTile label="Approved" value={totals.approved} accent="green" />
      </div>

      {applications.length === 0 ? (
        <DashboardCard>
          <DashboardEmptyState
            icon={<FileText size={22} />}
            title="No applications found"
            description="Try adjusting the status filter to reveal a different set of submissions."
          />
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const nominations =
              app.nominationApplications.length > 0
                ? app.nominationApplications
                : [{ id: app.id, category: app.category, award: app.award }];
            const previewNominations = nominations.slice(0, 3);
            const remainingNominationCount = nominations.length - previewNominations.length;

            return (
              <a
                key={app.id}
                href={`/admin/applications/${app.id}`}
                className="group block"
              >
                <DashboardCard className="overflow-hidden border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfe_60%,#f2f6fb_100%)] p-0 transition duration-300 hover:-translate-y-0.5 hover:border-[#4C7D9D]/30 hover:shadow-[0_24px_60px_rgba(16,32,59,0.12)]">
                  <div className="grid gap-5 px-5 py-5 md:px-6 md:py-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.95fr)]">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                            Participant
                          </p>
                          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#10203B]">
                            {app.fullName}
                          </h2>
                          <p className="mt-1 text-sm text-slate-500">{app.email}</p>
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                            <MapPin size={13} />
                            {app.city}, {app.country}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {applicationBadge(app.status)}
                          {paymentBadge(app.paymentStatus)}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4">
                          <div className="flex items-center gap-2 text-[#4C7D9D]">
                            <Layers3 size={16} />
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                              Nomination spread
                            </p>
                          </div>
                          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10203B]">
                            {nominations.length}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {nominations.length === 1
                              ? "Single nomination application."
                              : "Multiple nominations grouped into one premium review flow."}
                          </p>
                        </div>

                        <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
                            Nominations
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {previewNominations.map((nomination) => (
                              <span
                                key={nomination.id}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                              >
                                {nomination.award.name}
                              </span>
                            ))}
                            {remainingNominationCount > 0 ? (
                              <span className="rounded-full border border-dashed border-[#4C7D9D]/30 bg-[#E9F1F8] px-3 py-1 text-xs font-medium text-[#4C7D9D]">
                                +{remainingNominationCount} more
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-[#10203B]/8 bg-[#10203B] px-5 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                          Primary application path
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-7 text-white">
                          {app.award.name}
                        </p>
                        <p className="mt-1 text-sm text-white/60">{app.category.name}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-white/70">
                            <Clock3 size={15} />
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                              Created
                            </p>
                          </div>
                          <p className="mt-2 text-sm font-medium text-white">
                            {formatAdminDate(app.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-end justify-between rounded-[22px] border border-white/10 bg-white/5 p-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                              Open review
                            </p>
                            <p className="mt-2 text-sm text-white/75">
                              View grouped nomination sections and uploaded materials.
                            </p>
                          </div>
                          <ArrowRight
                            size={18}
                            className="shrink-0 text-white/80 transition group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
