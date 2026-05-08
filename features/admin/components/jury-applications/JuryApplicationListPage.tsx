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
            <AdminToolbarButton href="/admin/scoring">
              {t.admin.jury.scoringDashboard}
            </AdminToolbarButton>
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
              t.admin.common.status,
              t.admin.common.date,
            ]}
          >
            {applications.map((application) => (
              <AdminDataRow
                key={application.id}
                href={`/admin/jury-applications/${application.id}`}

              >
                <div>
                  <p className="justify-self-center text-sm font-semibold text-(--admin-ink)">
                    {application.fullName}
                  </p>
                  <p className="justify-self-center admin-muted mt-1 text-sm">
                    {application.email}
                  </p>
                  <p className="justify-self-center admin-muted mt-1 text-sm">
                    {application.city}, {application.country}
                  </p>
                </div>

                <div className="justify-self-center text-sm text-(--admin-ink)">
                  {application.professionalTitle}
                </div>

                <div className="justify-self-center flex flex-wrap gap-2">
                  {application.expertiseAreas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="admin-chip rounded-full px-3 py-1 text-xs"
                    >
                      {area}
                    </span>
                  ))}
                  {application.expertiseAreas.length > 3 ? (
                    <span className="justify-self-center admin-chip rounded-full px-3 py-1 text-xs">
                      +{application.expertiseAreas.length - 3}
                    </span>
                  ) : null}
                </div>

                <div className="justify-self-center">
                  <ApplicationStatusBadge status={application.status} />
                </div>

                <div className="justify-self-center admin-muted text-sm">
                  {application.paidAt
                    ? formatAdminDate(application.paidAt)
                    : formatAdminDate(application.submittedAt)}
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
