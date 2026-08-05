import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { JuryNominationListItem } from "@/features/jury/server/reviews";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import JuryNominationCard from "@/features/account/components/jury/JuryNominationCard";
import JuryReviewSummary from "@/features/account/components/jury/JuryReviewSummary";
import { getServerTranslations } from "@/lib/i18n/server";
import {
  DashboardStagger,
  EmptyState,
  PremiumButton,
} from "@/shared/components/admin/DashboardUI";

const CONTINUE_LIMIT = 2;

/**
 * Jury dashboard. One review-progress panel carries the queue statistics; the
 * "Continue reviewing" section surfaces the next nominations to work on. The
 * judge's approved categories are shown where they are actionable — as filters
 * on the nominations queue and in the account sidebar — rather than repeated
 * here.
 */
export default async function JuryOverview({
  nominations,
  totals,
}: {
  nominations: JuryNominationListItem[];
  totals: {
    assigned: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    remaining: number;
    completionPercentage: number;
  };
}) {
  const t = await getServerTranslations();
  const ov = t.account.jury.overview;
  const pending = nominations.filter(
    (nomination) =>
      nomination.reviewStatus === "IN_PROGRESS" || nomination.reviewStatus === "NOT_STARTED",
  );
  // Drafts already underway come first so a half-finished scorecard is the
  // obvious next action.
  const nextNominations = [
    ...pending.filter((nomination) => nomination.reviewStatus === "IN_PROGRESS"),
    ...pending.filter((nomination) => nomination.reviewStatus === "NOT_STARTED"),
  ].slice(0, CONTINUE_LIMIT);

  return (
    <div className="flex flex-col gap-5">
      <AccountPageHeader eyebrow={ov.eyebrow} title={ov.title} />

      <JuryReviewSummary
        completionPercentage={totals.completionPercentage}
        assigned={totals.assigned}
        notStarted={totals.notStarted}
        inProgress={totals.inProgress}
        completed={totals.completed}
        remaining={totals.remaining}
      />

      <section aria-labelledby="continue-reviewing-heading" className="mt-1">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="continue-reviewing-heading"
            className="font-[var(--font-title-family)] text-[clamp(1.5rem,3vw,2rem)] font-light leading-tight tracking-[-0.02em] text-[var(--color-ink)]"
          >
            {ov.continueReviewing}
          </h2>
          {nextNominations.length > 0 ? (
            <Link
              href="/account/jury/nominations"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
            >
              {ov.viewAll}
              <ArrowRight aria-hidden size={14} />
            </Link>
          ) : null}
        </div>

        {nextNominations.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={20} />}
            title={totals.assigned === 0 ? ov.noneAssignedTitle : ov.allDoneTitle}
            description={totals.assigned === 0 ? ov.noneAssignedText : ov.allDoneText}
            action={
              totals.completed > 0 ? (
                <PremiumButton href="/account/jury/completed">{ov.viewCompleted}</PremiumButton>
              ) : undefined
            }
          />
        ) : (
          <DashboardStagger className="grid gap-3">
            {nextNominations.map((nomination) => (
              <JuryNominationCard key={nomination.id} nomination={nomination} />
            ))}
          </DashboardStagger>
        )}
      </section>
    </div>
  );
}
