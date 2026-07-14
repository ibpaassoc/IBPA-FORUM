import Link from "next/link";
import { ArrowRight, FileText, Gauge, PenLine, Plus, Send, ShoppingBag } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import ApplicantHero from "@/features/account/components/ApplicantHero";
import NominationCard from "@/features/account/components/NominationCard";
import {
  DeadlineCard,
  QuickActionsCard,
  SupportCard,
} from "@/features/account/components/ApplicantWidgets";
import {
  applicantNominationStats,
  daysUntil,
  formatDateLabel,
  toNominationCardData,
} from "@/features/account/components/nomination-presentation";
import {
  DashboardStagger,
  EmptyState,
  MetricCard,
  PremiumButton,
} from "@/shared/components/admin/DashboardUI";

const OVERVIEW_NOMINATION_LIMIT = 4;

export default async function ApplicantDashboardPage() {
  const data = await getApplicantDashboardData();
  const stats = applicantNominationStats(data.nominations);
  const nominationCards = data.nominations.map(toNominationCardData);
  const latestNomination =
    [...data.nominations]
      .filter((nomination) => nomination.lockedAt === null && nomination.status !== "LOCKED")
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] ?? null;

  return (
    <div className="flex flex-col gap-5">
      <ApplicantHero
        overallCompletion={stats.overallCompletion}
        remainingCount={stats.remaining}
        daysRemaining={daysUntil(data.deadline)}
        deadlineLabel={formatDateLabel(data.deadline)}
        closedAtLabel={data.closedAt ? formatDateLabel(data.closedAt) : null}
      />

      <DashboardStagger className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Purchased"
          value={stats.total}
          detail="Paid nominations in your account"
          icon={ShoppingBag}
          accent="blue"
        />
        <MetricCard
          label="Drafts"
          value={stats.drafts}
          detail="Saved progress, not visible to judges"
          icon={PenLine}
          accent="amber"
        />
        <MetricCard
          label="Submitted"
          value={stats.submitted}
          detail="Visible to the jury"
          icon={Send}
          accent="green"
        />
        <MetricCard
          label="Completion"
          value={`${stats.overallCompletion}%`}
          detail="Average across nominations"
          icon={Gauge}
          accent="blue"
        />
      </DashboardStagger>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section
          aria-labelledby="my-nominations-heading"
          className="rounded-[30px] border border-[rgba(37,42,45,0.08)] bg-white/56 p-4 shadow-[0_12px_30px_rgba(37,42,45,0.04)] backdrop-blur-xl sm:p-5"
        >
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2
              id="my-nominations-heading"
              className="font-[var(--font-title-family)] text-[clamp(1.6rem,3vw,2.2rem)] font-light leading-tight tracking-[-0.02em] text-[var(--color-ink)]"
            >
              My nominations
            </h2>
            {nominationCards.length > OVERVIEW_NOMINATION_LIMIT ? (
              <Link
                href="/account/applicant/nominations"
                className="inline-flex shrink-0 items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] transition hover:text-[#4d86ad] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
              >
                View all <ArrowRight aria-hidden size={13} />
              </Link>
            ) : null}
          </div>

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
                View all {nominationCards.length} nominations
                <ArrowRight aria-hidden size={14} />
              </Link>
            </div>
          ) : null}
        </section>

        <aside className="flex flex-col gap-5">
          <QuickActionsCard latestNominationId={latestNomination?.id ?? null} />
          <DeadlineCard
            deadlineMonthLabel={new Intl.DateTimeFormat("en", { month: "short" }).format(data.deadline)}
            deadlineDayLabel={new Intl.DateTimeFormat("en", { day: "2-digit" }).format(data.deadline)}
            daysRemaining={daysUntil(data.deadline)}
            closed={data.closedAt !== null}
          />
          <SupportCard />
        </aside>
      </div>
    </div>
  );
}
