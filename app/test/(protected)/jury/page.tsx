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
} from "@/features/test/components/TestDashboardUI";

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
        label="Accounts and scoring"
        title="Jury"
      />
      {created ? <div role="status" className="rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300">Jury scenario created successfully.</div> : null}
      <DashboardSection title="Scenario builder" eyebrow="Create test data">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {scenarios.map(([kind, title, description, Icon]) => (
            <GlassCard key={kind} className="p-5" hover>
              <Icon aria-hidden size={18} className="text-zinc-400" />
              <h2 className="mt-4 font-sans text-lg font-semibold tracking-[-0.025em] text-white">{title}</h2>
              <p className="mt-2 min-h-14 text-sm leading-6 text-zinc-500">{description}</p>
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
          <EmptyState title="No test jury accounts" description="Create a scenario to begin." />
        ) : (
          <div className="grid gap-4">
            {data.accounts.map((account) => {
              const profile = account.juryProfile;
              return (
                <GlassCard key={account.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-sans text-xl font-semibold tracking-[-0.025em] text-white">{profile?.fullName ?? account.email}</h2>
                        <StatusBadge tone="blue">TEST</StatusBadge>
                        <StatusBadge tone="green">{profile?.approvalStatus ?? "ACTIVE"}</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{account.email}</p>
                      <p className="mt-3 text-xs text-zinc-500">Categories: {profile?.approvedCategories.join(", ") || "none"}</p>
                    </div>
                    <form action={openTestAccountAction}>
                      <input type="hidden" name="accountId" value={account.id} />
                      <PremiumButton type="submit">Open real jury UI</PremiumButton>
                    </form>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <form action={reassignTestJuryAction} className="rounded-[18px] border border-white/[0.08] bg-black/20 p-4">
                      <input type="hidden" name="accountId" value={account.id} />
                      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Reassign nomination</label>
                      <select name="nominationId" required className={`${dashboardSelectClass} mt-3`} defaultValue="">
                        <option value="" disabled>Select nomination</option>
                        {data.nominations.map((nomination) => <option key={nomination.id} value={nomination.id}>{nomination.applicantProfile.fullName} · {nomination.category.name} · {nomination.award.name}</option>)}
                      </select>
                      <SecondaryButton type="submit" className="mt-3">Reassign</SecondaryButton>
                    </form>
                    <div className="rounded-[18px] border border-white/[0.08] bg-black/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Reviews</p>
                      {profile?.reviews.length ? profile.reviews.map((review) => (
                        <div key={review.id} className="mt-3 flex items-center justify-between gap-3 text-sm">
                          <span>{review.nomination.award.name} · {review.status}</span>
                          {review.status === "COMPLETED" || review.status === "LOCKED" ? (
                            <form action={reopenTestReviewAction}>
                              <input type="hidden" name="reviewId" value={review.id} />
                              <button type="submit" className="text-xs font-semibold text-zinc-300 underline underline-offset-4 hover:text-white">Reopen</button>
                            </form>
                          ) : null}
                        </div>
                      )) : <p className="mt-3 text-sm text-zinc-500">No saved reviews.</p>}
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
