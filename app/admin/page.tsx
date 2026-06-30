import AdminLoginPage from "@/features/admin/components/auth/AdminLoginPage";
import AdminOverviewPage from "@/features/admin/components/overview/AdminOverviewPage";
import { getAdminScoringOverview } from "@/features/admin/server/admin";
import { getJuryApplications } from "@/features/admin/server/jury-queries";
import { getParticipantApplications } from "@/features/admin/server/participant-queries";
import { getSiteSettingBool } from "@/features/settings/server/site-settings";
import { getAllTickets } from "@/features/tickets/server/ticket-repository";
import { isGoogleSheetsConfigured } from "@/features/google-sheets";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return <AdminLoginPage />;
  }

  const [participantData, juryData, scoringData, tickets, earlyBirdEnabled] =
    await Promise.all([
      getParticipantApplications(),
      getJuryApplications(),
      getAdminScoringOverview({}),
      getAllTickets(),
      getSiteSettingBool("earlyBirdEnabled"),
    ]);

  return (
    <AdminOverviewPage
      participantTotals={participantData.totals}
      latestParticipants={participantData.applications.slice(0, 5)}
      juryStats={{
        totalCount: juryData.totalCount,
        pendingCount: juryData.pendingCount,
        approvedCount: juryData.approvedCount,
        activeJudgeCount: juryData.activeJudgeCount,
      }}
      latestJury={juryData.applications.slice(0, 4)}
      scoringStats={scoringData.stats}
      tickets={tickets}
      earlyBirdEnabled={earlyBirdEnabled}
      googleSheetsConfigured={isGoogleSheetsConfigured()}
    />
  );
}
