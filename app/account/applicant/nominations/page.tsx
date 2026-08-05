import { FileText, Plus } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import { getServerLanguage, getServerTranslations } from "@/lib/i18n/server";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import NominationCard from "@/features/account/components/NominationCard";
import { toNominationCardData } from "@/features/account/components/nomination-presentation";
import {
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
  const nominationCards = data.nominations.map((nomination) =>
    toNominationCardData(nomination, language),
  );

  return (
    <div className="flex flex-col gap-5">
      <AccountPageHeader
        eyebrow={t.account.nav.brand}
        title={np.title}
        actions={
          <PremiumButton href="/account/applicant/add-nomination">
            <Plus size={16} />
            <span className="hidden sm:inline">{ov.addNominations}</span>
            <span className="sm:hidden">{ov.add}</span>
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
