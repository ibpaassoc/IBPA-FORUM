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
  AdminFilterChip,
  AdminHeroCard,
  AdminSection,
  AdminStatCard,
  AdminToolbarButton,
} from "@/shared/components/admin/AdminDashboard";

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
    <AdminDashboardShell>
      <AdminHeroCard
        eyebrow={t.admin.participants.eyebrow}
        title={t.admin.participants.title}
        subtitle={t.admin.participants.text}
        actions={
          <>
            <AdminToolbarButton href="/admin/jury-applications">
              {t.admin.participants.juryDashboard}
            </AdminToolbarButton>
            <AdminToolbarButton href="/admin/scoring">
              {t.admin.participants.scoringDashboard}
            </AdminToolbarButton>
            <form action={logoutAdminAction}>
              <AdminToolbarButton type="submit">{t.admin.common.logout}</AdminToolbarButton>
            </form>
          </>
        }
      />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {summaryItems.map((item) => (
            <AdminStatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>

        <AdminSection className="mt-5">
          <div className="mb-5 flex flex-wrap gap-3">
            {filters.map((item) => (
              <AdminFilterChip key={item.label} href={item.href} active={item.active}>
                {item.label}
              </AdminFilterChip>
            ))}
          </div>

          <AdminDataTable
            headers={[
              t.admin.common.applicant,
              t.admin.common.category,
              t.admin.common.award,
              t.admin.participants.appStatus,
              t.admin.common.payment,
              t.admin.common.created,
              t.admin.common.open,
            ]}
            gridClassName="lg:grid-cols-[1.1fr_0.9fr_1fr_0.8fr_0.8fr_0.9fr_0.7fr]"
          >
            {applications.map((application) => (
              <AdminDataRow
                key={application.id}
                gridClassName="lg:grid-cols-[1.1fr_0.9fr_1fr_0.8fr_0.8fr_0.9fr_0.7fr]"
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
                  {application.category.name}
                </div>

                <div className="text-sm text-[var(--admin-ink)]">
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
                  <AdminToolbarButton
                    href={`/admin/applications/${application.id}`}
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
                <AdminEmptyState title={t.admin.participants.empty} />
              </div>
            ) : null}
          </AdminDataTable>
        </AdminSection>
    </AdminDashboardShell>
  );
}
