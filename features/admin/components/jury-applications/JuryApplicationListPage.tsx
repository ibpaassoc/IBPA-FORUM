"use client";

import Link from "next/link";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageShell } from "@/shared/components/layout/PageShell";

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
  const { t } = useLanguage();
  const summaryItems = [
    { label: t.admin.common.total, value: totalCount },
    { label: t.admin.common.submitted, value: pendingCount },
    { label: t.admin.common.approved, value: approvedCount },
    { label: t.admin.jury.paidJurors, value: activeJudgeCount },
  ];

  return (
    <PageShell className="admin-page px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="admin-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="admin-eyebrow">
              {t.admin.jury.eyebrow}
            </p>
            <h1 className="admin-heading mt-4 text-3xl font-semibold sm:text-4xl">
              {t.admin.jury.title}
            </h1>
            <p className="admin-copy mt-3 max-w-2xl text-sm leading-7">
              {t.admin.jury.text}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/applications"
              className="admin-action-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
            >
              {t.admin.jury.participantDashboard}
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

        <div className="mt-6 grid gap-4 md:grid-cols-4">
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
          <div className="admin-table-head hidden grid-cols-[1.15fr_0.95fr_0.95fr_0.75fr_0.75fr_0.8fr_0.65fr] gap-4 border-b px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] lg:grid">
            <span>{t.admin.common.candidate}</span>
            <span>{t.admin.common.title}</span>
            <span>{t.admin.common.expertise}</span>
            <span>{t.admin.common.application}</span>
            <span>{t.admin.common.payment}</span>
            <span>{t.admin.common.date}</span>
            <span>{t.admin.common.open}</span>
          </div>

          <div className="divide-y divide-[rgba(26,38,64,0.1)]">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 transition hover:bg-[rgba(201,169,110,0.07)] lg:grid-cols-[1.15fr_0.95fr_0.95fr_0.75fr_0.75fr_0.8fr_0.65fr] lg:items-center"
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
                  {application.professionalTitle}
                </div>

                <div className="flex flex-wrap gap-2">
                  {application.expertiseAreas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="admin-chip rounded-full px-3 py-1 text-xs"
                    >
                      {area}
                    </span>
                  ))}
                  {application.expertiseAreas.length > 3 ? (
                    <span className="admin-chip rounded-full px-3 py-1 text-xs">
                      +{application.expertiseAreas.length - 3}
                    </span>
                  ) : null}
                </div>

                <div>
                  <ApplicationStatusBadge status={application.status} />
                </div>

                <div>
                  <PaymentStatusBadge status={application.paymentStatus} />
                </div>

                <div className="admin-muted text-sm">
                  {application.paidAt
                    ? formatAdminDate(application.paidAt)
                    : formatAdminDate(application.submittedAt)}
                </div>

                <div>
                  <Link
                    href={`/admin/jury-applications/${application.id}`}
                    className="admin-action-primary inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
                  >
                    {t.admin.common.review}
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="admin-empty px-4 py-12 text-center text-sm">
                {t.admin.jury.empty}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
