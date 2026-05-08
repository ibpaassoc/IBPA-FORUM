"use client";

import Link from "next/link";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageShell } from "@/shared/components/layout/PageShell";

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
  const { t } = useLanguage();
  const summaryItems = [
    { label: t.admin.common.total, value: totals.total },
    { label: t.admin.common.paymentPending, value: totals.paymentPending },
    { label: t.admin.common.submitted, value: totals.submitted },
    { label: t.admin.common.underReview, value: totals.underReview },
    { label: t.admin.common.approved, value: totals.approved },
  ];
  const filters = [
    { label: "All", href: "/admin/applications", active: !activeStatus },
    {
      label: t.admin.common.paymentPending,
      href: "/admin/applications?status=PAYMENT_PENDING",
      active: activeStatus === "PAYMENT_PENDING",
    },
    {
      label: t.admin.common.submitted,
      href: "/admin/applications?status=SUBMITTED",
      active: activeStatus === "SUBMITTED",
    },
    {
      label: t.admin.common.underReview,
      href: "/admin/applications?status=UNDER_REVIEW",
      active: activeStatus === "UNDER_REVIEW",
    },
    {
      label: t.admin.common.approved,
      href: "/admin/applications?status=APPROVED",
      active: activeStatus === "APPROVED",
    },
    {
      label: t.admin.common.rejected,
      href: "/admin/applications?status=REJECTED",
      active: activeStatus === "REJECTED",
    },
  ];

  return (
    <PageShell className="admin-page px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="admin-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="admin-eyebrow">
              {t.admin.participants.eyebrow}
            </p>
            <h1 className="admin-heading mt-4 text-3xl font-semibold sm:text-4xl">
              {t.admin.participants.title}
            </h1>
            <p className="admin-copy mt-3 max-w-2xl text-sm leading-7">
              {t.admin.participants.text}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/jury-applications"
              className="admin-action-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
            >
              {t.admin.participants.juryDashboard}
            </Link>
            <Link
              href="/admin/scoring"
              className="admin-action-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
            >
              {t.admin.participants.scoringDashboard}
            </Link>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="admin-action-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
              >
                {t.admin.common.logout}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="admin-card rounded-2xl p-5"
            >
              <p className="admin-eyebrow">
                {item.label}
              </p>
              <p className="admin-heading mt-3 text-3xl font-semibold">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <section className="admin-card mt-6 rounded-3xl p-4 md:p-6">
          <div className="mb-5 flex flex-wrap gap-3">
            {filters.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`inline-flex rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                  item.active
                    ? "border-[#c9a96e]/60 bg-[#f4ead4] text-[#6e521f]"
                    : "border-[rgba(26,38,64,0.14)] bg-white text-[#40516a] hover:border-[#c9a96e]/60 hover:text-[#8b682b]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="admin-table-head hidden grid-cols-[1.1fr_0.9fr_1fr_0.8fr_0.8fr_0.9fr_0.7fr] gap-4 border-b px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] lg:grid">
            <span>{t.admin.common.applicant}</span>
            <span>{t.admin.common.category}</span>
            <span>{t.admin.common.award}</span>
            <span>{t.admin.participants.appStatus}</span>
            <span>{t.admin.common.payment}</span>
            <span>{t.admin.common.created}</span>
            <span>{t.admin.common.open}</span>
          </div>

          <div className="divide-y divide-[rgba(26,38,64,0.1)]">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 transition hover:bg-[rgba(201,169,110,0.07)] lg:grid-cols-[1.1fr_0.9fr_1fr_0.8fr_0.8fr_0.9fr_0.7fr] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-navy-deep)]">
                    {application.fullName}
                  </p>
                  <p className="admin-muted mt-1 text-sm">
                    {application.email}
                  </p>
                  <p className="admin-muted mt-1 text-sm">
                    {application.city}, {application.country}
                  </p>
                </div>

                <div className="text-sm text-[var(--color-navy)]">
                  {application.category.name}
                </div>

                <div className="text-sm text-[var(--color-navy)]">
                  {application.award.name}
                </div>

                <div>
                  <ApplicationStatusBadge status={application.status} />
                </div>

                <div>
                  <PaymentStatusBadge status={application.paymentStatus} />
                </div>

                <div className="admin-muted text-sm">
                  {formatAdminDate(application.createdAt)}
                </div>

                <div>
                  <Link
                    href={`/admin/applications/${application.id}`}
                    className="admin-action-primary inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
                  >
                    {t.admin.common.review}
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="admin-empty px-4 py-12 text-center text-sm">
                {t.admin.participants.empty}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
