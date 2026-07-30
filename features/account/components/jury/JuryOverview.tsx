import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { JuryNominationListItem } from "@/features/jury/server/reviews";
import JuryNominationCard from "@/features/account/components/jury/JuryNominationCard";
import JuryStats from "@/features/account/components/jury/JuryStats";
import {
  EmptyState,
  PremiumButton,
} from "@/shared/components/admin/DashboardUI";

export default function JuryOverview({
  juryName,
  professionalTitle,
  approvedCategories,
  nominations,
  totals,
}: {
  juryName: string;
  professionalTitle: string;
  approvedCategories: string[];
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
  const nextNominations = nominations.filter(
    (nomination) => nomination.reviewStatus === "IN_PROGRESS" || nomination.reviewStatus === "NOT_STARTED",
  ).slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <section className="relative overflow-hidden rounded-[34px] border border-[rgba(114,160,193,0.22)] bg-white/80 p-5 shadow-[0_30px_95px_rgba(37,42,45,0.09)] backdrop-blur-2xl sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-[rgba(185,217,235,0.34)] blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-end">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">Jury workspace</p>
            <h1 className="mt-2 max-w-3xl font-[var(--font-title-family)] text-[clamp(2.15rem,5vw,3.75rem)] font-light leading-[1.02] tracking-[-0.035em] text-[var(--color-ink)]">Welcome back, {juryName.split(" ")[0]}.</h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-[var(--color-ink-soft)]">Review each nomination independently, save your work as you go, and submit only when every regulation criterion is complete.</p>
            <div className="mt-5 rounded-[24px] border border-[rgba(114,160,193,0.2)] bg-white/64 p-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                Jury profile
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-start">
                <p className="text-sm font-medium text-[var(--color-ink)]">Approved categories</p>
                <div className="flex flex-wrap gap-2">
                  {approvedCategories.map((category) => (
                    <span key={category} className="rounded-full border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#356f98]">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_16px_45px_rgba(37,42,45,0.06)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">Review progress</p>
                <p className="mt-2 font-[var(--font-title-family)] text-5xl font-light tracking-[-0.05em] text-[var(--color-ink)]">{totals.completionPercentage}<span className="text-2xl text-[var(--color-ink-soft)]">%</span></p>
              </div>
              <p className="text-right text-sm leading-5 text-[var(--color-ink-soft)]">{totals.remaining === 0 ? "Queue complete" : `${totals.remaining} remaining`}</p>
            </div>
            <div role="progressbar" aria-valuenow={totals.completionPercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Jury review progress" className="mt-4 h-2.5 overflow-hidden rounded-full bg-[rgba(114,160,193,0.14)]">
              <div className="h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${totals.completionPercentage}%` }} />
            </div>
            {professionalTitle ? <p className="mt-4 font-[var(--font-accent-family)] text-sm italic text-[var(--color-ink-soft)]">{professionalTitle}</p> : null}
          </div>
        </div>
      </section>

      <JuryStats assigned={totals.assigned} notStarted={totals.notStarted} inProgress={totals.inProgress} completed={totals.completed} />

      <section aria-labelledby="next-reviews-heading" className="rounded-[30px] border border-[rgba(37,42,45,0.08)] bg-white/56 p-4 shadow-[0_12px_30px_rgba(37,42,45,0.04)] backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">Priority queue</p>
            <h2 id="next-reviews-heading" className="mt-1 font-[var(--font-title-family)] text-[clamp(1.7rem,3vw,2.3rem)] font-light tracking-[-0.025em] text-[var(--color-ink)]">Continue reviewing</h2>
          </div>
          <Link href="/account/jury/nominations" className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] transition hover:text-[#4d86ad]">View all <ArrowRight aria-hidden size={13} /></Link>
        </div>

        {nextNominations.length === 0 ? (
          <EmptyState icon={<CheckCircle2 size={20} />} title={totals.assigned === 0 ? "No nominations assigned" : "All reviews complete"} description={totals.assigned === 0 ? "Eligible submitted nominations in your approved categories will appear here." : "You have completed every nomination in your approved categories."} action={totals.completed > 0 ? <PremiumButton href="/account/jury/completed">View completed reviews</PremiumButton> : undefined} />
        ) : (
          <div className="grid gap-3">{nextNominations.map((nomination) => <JuryNominationCard key={nomination.id} nomination={nomination} />)}</div>
        )}
      </section>
    </div>
  );
}
