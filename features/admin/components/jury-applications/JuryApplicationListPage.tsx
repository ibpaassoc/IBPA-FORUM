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
    <PageShell className="px-6 py-10 text-white md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="page-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              {t.admin.jury.eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {t.admin.jury.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4ca]">
              {t.admin.jury.text}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/applications"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              {t.admin.jury.participantDashboard}
            </Link>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
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
              className="page-card rounded-2xl bg-white/4.5 p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <section className="page-card mt-6 rounded-3xl p-4 md:p-6">
          <div className="hidden grid-cols-[1.15fr_0.95fr_0.95fr_0.75fr_0.75fr_0.8fr_0.65fr] gap-4 border-b border-white/10 px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9d4ca]/65 lg:grid">
            <span>{t.admin.common.candidate}</span>
            <span>{t.admin.common.title}</span>
            <span>{t.admin.common.expertise}</span>
            <span>{t.admin.common.application}</span>
            <span>{t.admin.common.payment}</span>
            <span>{t.admin.common.date}</span>
            <span>{t.admin.common.open}</span>
          </div>

          <div className="divide-y divide-white/10">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 transition hover:bg-white/2 lg:grid-cols-[1.15fr_0.95fr_0.95fr_0.75fr_0.75fr_0.8fr_0.65fr] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {application.fullName}
                  </p>
                  <p className="mt-1 text-sm text-[#d9d4ca]/80">
                    {application.email}
                  </p>
                  <p className="mt-1 text-sm text-[#d9d4ca]/80">
                    {application.city}, {application.country}
                  </p>
                </div>

                <div className="text-sm text-[#d9d4ca]">
                  {application.professionalTitle}
                </div>

                <div className="flex flex-wrap gap-2">
                  {application.expertiseAreas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs text-[#d9d4ca]"
                    >
                      {area}
                    </span>
                  ))}
                  {application.expertiseAreas.length > 3 ? (
                    <span className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs text-[#d9d4ca]/60">
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

                <div className="text-sm text-[#d9d4ca]/75">
                  {application.paidAt
                    ? formatAdminDate(application.paidAt)
                    : formatAdminDate(application.submittedAt)}
                </div>

                <div>
                  <Link
                    href={`/admin/jury-applications/${application.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#e2d093]"
                  >
                    {t.admin.common.review}
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#d9d4ca]/75">
                {t.admin.jury.empty}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
