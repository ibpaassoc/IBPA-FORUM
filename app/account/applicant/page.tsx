import Link from "next/link";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import { formatApplicantDeadlinePart } from "@/features/applications/lib/deadline-timezone";
import { getServerLanguage, getServerTranslations } from "@/lib/i18n/server";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import ApplicantSummary from "@/features/account/components/ApplicantSummary";
import NominationCard from "@/features/account/components/NominationCard";
import {
  applicantNominationStats,
  daysUntil,
  toNominationCardData,
} from "@/features/account/components/nomination-presentation";
import {
  DashboardStagger,
  EmptyState,
  PremiumButton,
} from "@/shared/components/admin/DashboardUI";

const OVERVIEW_NOMINATION_LIMIT = 4;

export default async function ApplicantDashboardPage() {
  const [data, language, t] = await Promise.all([
    getApplicantDashboardData(),
    getServerLanguage(),
    getServerTranslations(),
  ]);
  const ov = t.account.overview;
  const dateLocale = language === "ua" ? "uk" : language;
  const stats = applicantNominationStats(data.nominations);
  const nominationCards = data.nominations.map((nomination) =>
    toNominationCardData(nomination, language),
  );

  return (
    <div className="flex flex-col gap-5">
      <AccountPageHeader
        eyebrow={ov.eyebrow}
        title={data.applicationsClosed ? ov.closedTitle : ov.openTitle}
      />

      <ApplicantSummary
        overallCompletion={stats.overallCompletion}
        purchased={stats.total}
        drafts={stats.drafts}
        submitted={stats.submitted}
        deadlineMonthLabel={formatApplicantDeadlinePart(data.deadline, dateLocale, { month: "short" })}
        deadlineDayLabel={formatApplicantDeadlinePart(data.deadline, dateLocale, { day: "2-digit" })}
        daysRemaining={daysUntil(data.deadline)}
        closed={data.applicationsClosed}
      />

      <section aria-labelledby="my-nominations-heading" className="mt-1">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="my-nominations-heading"
            className="font-[var(--font-title-family)] text-[clamp(1.5rem,3vw,2rem)] font-light leading-tight tracking-[-0.02em] text-[var(--color-ink)]"
          >
            {ov.myNominations}
          </h2>
          {!data.applicationsClosed ? (
            <PremiumButton href="/account/applicant/add-nomination">
              <Plus size={16} />
              <span className="hidden sm:inline">{ov.addNominations}</span>
              <span className="sm:hidden">{ov.add}</span>
            </PremiumButton>
          ) : null}
        </div>

        {nominationCards.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} />}
            title={ov.emptyTitle}
            description={ov.emptyText}
            action={!data.applicationsClosed ? (
              <PremiumButton href="/account/applicant/add-nomination">
                <Plus size={16} /> {ov.addNominations}
              </PremiumButton>
            ) : undefined}
          />
        ) : (
          <DashboardStagger className="grid gap-3">
            {nominationCards.slice(0, OVERVIEW_NOMINATION_LIMIT).map((nomination) => (
              <NominationCard key={nomination.id} nomination={nomination} />
            ))}
          </DashboardStagger>
        )}

        {nominationCards.length > OVERVIEW_NOMINATION_LIMIT ? (
          <div className="mt-4 text-center">
            <Link
              href="/account/applicant/nominations"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
            >
              {ov.viewAll} ({nominationCards.length})
              <ArrowRight aria-hidden size={14} />
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
