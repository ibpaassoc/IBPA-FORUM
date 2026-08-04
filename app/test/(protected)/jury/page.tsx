import { CheckCircle2, CircleDashed, ClipboardCheck, Scale } from "lucide-react";
import { getTestJuryRecords } from "@/features/test/server/flow-records";
import {
  createJuryScenarioAction,
  openTestAccountAction,
  reassignTestJuryAction,
  reopenTestReviewAction,
} from "../flows/actions";
import {
  DashboardHeader,
  DashboardSection,
  EmptyState,
  GlassCard,
  PremiumButton,
  SecondaryButton,
  StatusBadge,
  dashboardSelectClass,
} from "@/shared/components/admin/DashboardUI";

const scenarios = [
  ["jury-empty", "Empty queue", "Approved jury with no matching nominations", CircleDashed],
  ["jury-unreviewed", "Unreviewed assignment", "Submitted nomination ready to score", Scale],
  ["jury-partial", "Partial review", "Draft saved through the real review service", ClipboardCheck],
  ["jury-submitted", "Submitted review", "Complete, validated and locked review", CheckCircle2],
] as const;

export default async function TestJuryPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ created }, data] = await Promise.all([searchParams, getTestJuryRecords()]);
  return (
    <div className="space-y-8">
      <DashboardHeader
        label="Production scoring workspace"
        title="Jury testing"
        description="Create isolated jury accounts, assign only test nominations, and open the exact jury review UI for draft and final validation."
      />
      {created ? <div role="status" className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">Jury scenario created successfully.</div> : null}
      <DashboardSection title="Create a scenario" eyebrow="Real jury activation and review services">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {scenarios.map(([kind, title, description, Icon]) => (
            <GlassCard key={kind} className="p-5" hover>
              <Icon aria-hidden size={20} className="text-[var(--color-blue)]" />
              <h2 className="mt-4 font-[var(--font-title-family)] text-xl font-light">{title}</h2>
              <p className="mt-2 min-h-16 text-sm leading-6 text-[var(--color-ink-soft)]">{description}</p>
              <form action={createJuryScenarioAction} className="mt-4">
                <input type="hidden" name="kind" value={kind} />
                <SecondaryButton type="submit">Create</SecondaryButton>
              </form>
            </GlassCard>
          ))}
        </div>
      </DashboardSection>
      <DashboardSection title="Test jury accounts" eyebrow={`${data.accounts.length} isolated account${data.accounts.length === 1 ? "" : "s"}`}>
        {data.accounts.length === 0 ? (
          <EmptyState title="No test jury accounts yet" description="Create a scenario above. Production jury members never appear here." />
        ) : (
          <div className="grid gap-4">
            {data.accounts.map((account) => {
              const profile = account.juryProfile;
              return (
                <GlassCard key={account.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-[var(--font-title-family)] text-2xl font-light">{profile?.fullName ?? account.email}</h2>
                        <StatusBadge tone="blue">TEST</StatusBadge>
                        <StatusBadge tone="green">{profile?.approvalStatus ?? "ACTIVE"}</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{account.email}</p>
                      <p className="mt-3 text-xs text-[var(--color-ink-soft)]">Categories: {profile?.approvedCategories.join(", ") || "none"}</p>
                    </div>
                    <form action={openTestAccountAction}>
                      <input type="hidden" name="accountId" value={account.id} />
                      <PremiumButton type="submit">Open real jury UI</PremiumButton>
                    </form>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <form action={reassignTestJuryAction} className="rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-white/70 p-4">
                      <input type="hidden" name="accountId" value={account.id} />
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">Reassign to a test nomination</label>
                      <select name="nominationId" required className={`${dashboardSelectClass} mt-3`} defaultValue="">
                        <option value="" disabled>Select nomination</option>
                        {data.nominations.map((nomination) => <option key={nomination.id} value={nomination.id}>{nomination.applicantProfile.fullName} · {nomination.category.name} · {nomination.award.name}</option>)}
                      </select>
                      <SecondaryButton type="submit" className="mt-3">Reassign</SecondaryButton>
                    </form>
                    <div className="rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">Reviews</p>
                      {profile?.reviews.length ? profile.reviews.map((review) => (
                        <div key={review.id} className="mt-3 flex items-center justify-between gap-3 text-sm">
                          <span>{review.nomination.award.name} · {review.status}</span>
                          {review.status === "COMPLETED" || review.status === "LOCKED" ? (
                            <form action={reopenTestReviewAction}>
                              <input type="hidden" name="reviewId" value={review.id} />
                              <button type="submit" className="text-xs font-semibold text-[var(--color-blue)] underline underline-offset-4">Reopen</button>
                            </form>
                          ) : null}
                        </div>
                      )) : <p className="mt-3 text-sm text-[var(--color-ink-soft)]">No saved reviews.</p>}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
