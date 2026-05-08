"use client";

import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  AdminDashboardShell,
  AdminDataRow,
  AdminDataTable,
  AdminEmptyState,
  AdminHeroCard,
  AdminSection,
  AdminStatCard,
  AdminToolbarButton,
} from "@/shared/components/admin/AdminDashboard";

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
    <AdminDashboardShell>
      <AdminHeroCard
        eyebrow={t.admin.jury.eyebrow}
        title={t.admin.jury.title}
        subtitle={t.admin.jury.text}
        actions={
          <>
            <AdminToolbarButton href="/admin/applications">
              {t.admin.jury.participantDashboard}
            </AdminToolbarButton>
            <form action={logoutAdminAction}>
              <AdminToolbarButton type="submit">{t.admin.common.logout}</AdminToolbarButton>
            </form>
          </>
        }
      />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <AdminStatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>

        <AdminSection className="mt-5">
          <AdminDataTable
            headers={[
              t.admin.common.candidate,
              t.admin.common.title,
              t.admin.common.expertise,
              t.admin.common.application,
              t.admin.common.payment,
              t.admin.common.date,
              t.admin.common.open,
            ]}
            gridClassName="lg:grid-cols-[1.15fr_0.95fr_0.95fr_0.75fr_0.75fr_0.8fr_0.65fr]"
          >
            {applications.map((application) => (
              <AdminDataRow
                key={application.id}
                gridClassName="lg:grid-cols-[1.15fr_0.95fr_0.95fr_0.75fr_0.75fr_0.8fr_0.65fr]"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--admin-ink)]">
                    {application.fullName}
                  </p>
                  <p className="admin-muted mt-1 text-sm">
                    {application.email}
                  </p>
                  <p className="admin-muted mt-1 text-sm">
                    {application.city}, {application.country}
                  </p>
                </div>

                <div className="text-sm text-[var(--admin-ink)]">
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
                  <AdminToolbarButton
                    href={`/admin/jury-applications/${application.id}`}
                    variant="primary"
                    className="px-4 py-2"
                  >
                    {t.admin.common.review}
                  </AdminToolbarButton>
                </div>
              </AdminDataRow>
            ))}

            {applications.length === 0 ? (
              <div className="px-4 py-5">
                <AdminEmptyState title={t.admin.jury.empty} />
              </div>
            ) : null}
          </AdminDataTable>
        </AdminSection>
    </AdminDashboardShell>
  );
}
