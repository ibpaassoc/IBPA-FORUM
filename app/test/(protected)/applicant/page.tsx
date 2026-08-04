import { AlertCircle, CheckCircle2, FileWarning, Layers3, PlusCircle, UserRoundPlus } from "lucide-react";
import { getTestApplicantRecords } from "@/features/test/server/flow-records";
import {
  createApplicantScenarioAction,
  createFullFlowScenarioAction,
  openTestAccountAction,
  reopenTestNominationAction,
} from "../flows/actions";
import {
  DashboardHeader,
  DashboardSection,
  EmptyState,
  GlassCard,
  PremiumButton,
  SecondaryButton,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

const scenarios = [
  ["applicant-empty", "New applicant", "Account with no nominations", UserRoundPlus],
  ["applicant-draft", "Draft nomination", "Paid nomination ready to edit", PlusCircle],
  ["applicant-incomplete", "Incomplete nomination", "Partial data and real completion errors", AlertCircle],
  ["applicant-submitted", "Submitted nomination", "Complete and submitted state", CheckCircle2],
  ["applicant-multiple", "Multiple nominations", "Three paid submitted nominations", Layers3],
  ["applicant-upload-failure", "Upload failure", "Invalid upload metadata scenario", FileWarning],
] as const;

export default async function TestApplicantPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; full?: string }>;
}) {
  const [{ created, full }, accounts] = await Promise.all([searchParams, getTestApplicantRecords()]);
  return (
    <div className="space-y-8">
      <DashboardHeader
        label="Production applicant experience"
        title="Applicant testing"
        description="Create isolated accounts and then open the real applicant dashboard to purchase, edit, upload, validate, submit, reopen, and resubmit nominations."
        actions={<form action={createFullFlowScenarioAction}><PremiumButton type="submit">Create full flow</PremiumButton></form>}
      />
      {created ? (
        <div role="status" className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          {full ? "Full applicant → submission → jury scenario created." : "Applicant scenario created successfully."}
        </div>
      ) : null}
      <DashboardSection title="Create a scenario" eyebrow="Real account and payment handlers">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {scenarios.map(([kind, title, description, Icon]) => (
            <GlassCard key={kind} className="p-5" hover>
              <Icon aria-hidden size={20} className="text-[var(--color-blue)]" />
              <h2 className="mt-4 font-[var(--font-title-family)] text-2xl font-light">{title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--color-ink-soft)]">{description}</p>
              <form action={createApplicantScenarioAction} className="mt-5">
                <input type="hidden" name="kind" value={kind} />
                <SecondaryButton type="submit">Create</SecondaryButton>
              </form>
            </GlassCard>
          ))}
        </div>
      </DashboardSection>
      <DashboardSection title="Test applicants" eyebrow={`${accounts.length} isolated account${accounts.length === 1 ? "" : "s"}`}>
        {accounts.length === 0 ? (
          <EmptyState title="No test applicants yet" description="Create a scenario above. Production applicants never appear in this list." />
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => {
              const profile = account.applicantProfile;
              const nominations = profile?.nominations ?? [];
              return (
                <GlassCard key={account.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-[var(--font-title-family)] text-2xl font-light">{profile?.fullName ?? account.email}</h2>
                        <StatusBadge tone="blue">TEST</StatusBadge>
                        <StatusBadge tone={account.status === "ACTIVE" ? "green" : "amber"}>{account.status}</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{account.email}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                        {nominations.length} nominations · {profile?.payments.length ?? 0} payments
                      </p>
                    </div>
                    <form action={openTestAccountAction}>
                      <input type="hidden" name="accountId" value={account.id} />
                      <PremiumButton type="submit">Open real applicant UI</PremiumButton>
                    </form>
                  </div>
                  {nominations.length > 0 ? (
                    <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {nominations.map((nomination) => (
                        <div key={nomination.id} className="rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-white/70 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{nomination.award.name}</p>
                              <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{nomination.category.name}</p>
                            </div>
                            <StatusBadge tone={nomination.status === "SUBMITTED" ? "green" : "amber"}>{nomination.status}</StatusBadge>
                          </div>
                          <p className="mt-3 text-xs text-[var(--color-ink-soft)]">{nomination.answers.length} answers · {nomination.files.length} files · {nomination.paymentStatus.toLowerCase()}</p>
                          {nomination.status === "SUBMITTED" || nomination.status === "LOCKED" ? (
                            <form action={reopenTestNominationAction} className="mt-3">
                              <input type="hidden" name="nominationId" value={nomination.id} />
                              <button type="submit" className="text-xs font-semibold text-[var(--color-blue)] underline underline-offset-4">Return for changes</button>
                            </form>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </GlassCard>
              );
            })}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}

