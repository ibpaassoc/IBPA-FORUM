import { FileText, Plus } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import { getServerLanguage, getServerTranslations } from "@/lib/i18n/server";
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
  const [data, language, t] = await Promise.all([
    getApplicantDashboardData(),
    getServerLanguage(),
    getServerTranslations(),
  ]);
  const np = t.account.nominationsPage;
  const ov = t.account.overview;
  const stats = applicantNominationStats(data.nominations);
  const nominationCards = data.nominations.map((nomination) =>
    toNominationCardData(nomination, language),
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={t.account.nav.brand}
        title={np.title}
        description={
          nominationCards.length === 0
            ? ov.emptyText
            : `${stats.total} ${np.purchasedWord} · ${stats.drafts} ${np.draftWord} · ${stats.submitted} ${np.submittedWord}. ${np.visibilityNote}`
        }
        actions={
          <PremiumButton href="/account/applicant/add-nomination">
            <Plus size={16} /> {ov.addNominations}
          </PremiumButton>
        }
      />

      {nominationCards.length === 0 ? (
        <EmptyState
          icon={<FileText size={20} />}
          title={ov.emptyTitle}
          description={ov.emptyText}
          action={
            <PremiumButton href="/account/applicant/add-nomination">
              <Plus size={16} /> {ov.addNominations}
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
