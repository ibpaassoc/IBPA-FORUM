"use client";
import { formatAdminDate } from "@/features/admin/server/view-models";
import JurySignOutButton from "@/features/jury/components/dashboard/JurySignOutButton";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
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

export default function JuryDashboardPage({
  juryName,
  professionalTitle,
  expertiseAreas,
  applications,
  activeCategory,
  totals,
}: {
  juryName: string;
  professionalTitle: string;
  expertiseAreas: string[];
  applications: Array<{
    id: string;
    fullName: string;
    email: string;
    city: string;
    country: string;
    createdAt: Date;
    submittedAt: Date | null;
    category: { name: string };
    award: { name: string };
    scoreStatus: "NOT_STARTED" | "DRAFT" | "SUBMITTED";
    scoreId: string | null;
  }>;
  activeCategory?: string;
  totals: {
    totalAssignedApplications: number;
    scoredApplications: number;
    remainingApplications: number;
    categories: number;
  };
}) {
  const { t } = useLanguage();
  const summaryItems = [
    { label: t.juryDashboard.assigned, value: totals.totalAssignedApplications },
    { label: t.juryDashboard.scored, value: totals.scoredApplications },
    { label: t.juryDashboard.remaining, value: totals.remainingApplications },
    { label: t.juryDashboard.approvedCategories, value: totals.categories },
  ];

  return (
    <AdminDashboardShell>
      <AdminHeroCard
        eyebrow={t.juryDashboard.dashboard}
        title={juryName}
        subtitle={`${professionalTitle}. ${t.juryDashboard.accessText}`}
        actions={<JurySignOutButton />}
      />

      <AdminSection
        className="mt-5"
        eyebrow={t.juryDashboard.approvedCategories}
      >
        {expertiseAreas.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {expertiseAreas.map((area) => (
              <span
                key={area}
                className="admin-chip rounded-full px-3 py-1 text-xs font-semibold"
              >
                {area}
              </span>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title={t.juryDashboard.approvedCategories}
            text={t.juryDashboard.empty}
          />
        )}
      </AdminSection>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryItems.map((item) => (
          <AdminStatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <AdminSection className="mt-5">
          <div className="justify-self-center mt-2 mb-10 flex flex-wrap gap-3">
            {[
              { label: t.juryDashboard.allCategories, href: "/jury/dashboard", active: !activeCategory },
              ...expertiseAreas.map((area) => ({
                label: area,
                href: `/jury/dashboard?direction=${encodeURIComponent(area)}`,
                active: activeCategory === area,
              })),
            ].map((item) => (
              <AdminFilterChip
                key={item.label}
                href={item.href}
                active={item.active}
              >
                {item.label}
              </AdminFilterChip>
            ))}
          </div>

          <AdminDataTable
            headers={[
              t.juryDashboard.applicant,
              t.juryDashboard.category,
              t.juryDashboard.award,
              t.juryDashboard.status,
              t.juryDashboard.submitted,
            ]}
          >
            {applications.map((application) => (
              <AdminDataRow
                key={application.id}
                href={`/jury/dashboard/applications/${application.id}`}
              >
                <div>
                  <p className="justify-self-center text-sm font-semibold text-(--admin-ink)">
                    {application.fullName}
                  </p>
                  <p className="justify-self-center admin-muted mt-1 text-sm">{application.email}</p>
                  <p className="justify-self-center admin-muted mt-1 text-sm">
                    {application.city}, {application.country}
                  </p>
                </div>

                <div className="justify-self-center text-sm text-(--admin-ink)">{application.category.name}</div>

                <div className="justify-self-center text-sm text-(--admin-ink)">{application.award.name}</div>

                <div className="justify-self-center">
                  <ScoreStatusBadge status={application.scoreStatus} />
                </div>

                <div className="justify-self-center admin-muted text-sm">
                  {formatAdminDate(application.submittedAt ?? application.createdAt)}
                </div>
              </AdminDataRow>
            ))}

            {applications.length === 0 ? (
              <div className="px-4 py-5">
                <AdminEmptyState title={t.juryDashboard.empty} />
              </div>
            ) : null}
          </AdminDataTable>
      </AdminSection>
    </AdminDashboardShell>
  );
}
