import { FileText, Plus } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import NominationCard from "@/features/account/components/NominationCard";
import {
  applicantNominationStats,
  toNominationCardData,
} from "@/features/account/components/nomination-presentation";
import {
  DashboardPageHeader,
  DashboardStagger,
  EmptyState,
  PremiumButton,
} from "@/shared/components/admin/DashboardUI";

export default async function ApplicantNominationsPage() {
  const data = await getApplicantDashboardData();
  const stats = applicantNominationStats(data.nominations);
  const nominationCards = data.nominations.map(toNominationCardData);

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Applicant account"
        title="My nominations"
        description={
          nominationCards.length === 0
            ? "Paid nominations appear here after checkout is confirmed."
            : `${stats.total} purchased · ${stats.drafts} in draft · ${stats.submitted} submitted. Purchased and draft nominations are not visible to judges until submitted.`
        }
        actions={
          <PremiumButton href="/account/applicant/add-nomination">
            <Plus size={16} /> Add nominations
          </PremiumButton>
        }
      />

      {nominationCards.length === 0 ? (
        <EmptyState
          icon={<FileText size={20} />}
          title="No nominations yet"
          description="Paid nominations will appear here after checkout is confirmed."
          action={
            <PremiumButton href="/account/applicant/add-nomination">
              <Plus size={16} /> Add nominations
            </PremiumButton>
          }
        />
      ) : (
        <DashboardStagger className="grid gap-3">
          {nominationCards.map((nomination) => (
            <NominationCard key={nomination.id} nomination={nomination} />
          ))}
        </DashboardStagger>
      )}
    </div>
  );
}
