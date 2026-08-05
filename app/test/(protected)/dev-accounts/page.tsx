import {
  KeyRound,
  Mail,
  Plus,
  Scale,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { getDevAccountsDashboard } from "@/features/test/server/dev-accounts";
import { DevLinkPanel } from "@/features/test/components/DevLinkPanel";
import {
  DashboardHeader,
  DashboardSection,
  EmptyState,
  GlassCard,
  NativeConfirmForm,
  PremiumButton,
  SecondaryButton,
  StatusBadge,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/features/test/components/TestDashboardUI";
import {
  addDevApplicantNominationAction,
  createDevAccountAction,
  createDevResetLinkAction,
  createDevSetupLinkAction,
  deleteDevAccountAction,
  removeDevApplicantNominationAction,
  sendDevResetEmailAction,
  sendDevSetupEmailAction,
  setDevAccountEnabledAction,
  setDevAccountPasswordAction,
  updateDevJuryCategoriesAction,
} from "./actions";

const fieldLabelClass =
  "mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-zinc-500";

function Feedback({ notice, error }: { notice?: string; error?: string }) {
  if (!notice && !error) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={
        error
          ? "rounded-[18px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200"
          : "rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300"
      }
    >
      {error ?? notice}
    </div>
  );
}

function HiddenAccountId({ id }: { id: string }) {
  return <input type="hidden" name="accountId" value={id} />;
}

export default async function DevAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string; link?: string }>;
}) {
  const [{ notice, error, link }, { accounts, categories }] = await Promise.all([
    searchParams,
    getDevAccountsDashboard(),
  ]);

  return (
    <div className="space-y-8">
      <DashboardHeader
        label="Persistent isolated identities"
        title="DEV accounts"
        description="Create real applicant and jury credentials that use the normal /login flow. Every account, nomination, password token, and jury review stays in the DEV scope: invisible to production admin and production judges."
        actions={<PremiumButton href="/login">Open /login</PremiumButton>}
      />

      <Feedback notice={notice} error={error} />
      {link ? <DevLinkPanel link={link} /> : null}

      <DashboardSection title="Create accounts" eyebrow="Applicant or jury">
        <div className="grid gap-4 xl:grid-cols-2">
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                <UserRound aria-hidden size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Applicant</h2>
                <p className="text-sm text-zinc-500">Add paid DEV nominations now or later.</p>
              </div>
            </div>
            <form action={createDevAccountAction} className="mt-6 space-y-4">
              <input type="hidden" name="role" value="APPLICANT" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={fieldLabelClass}>Full name</span>
                  <input name="fullName" required className={dashboardInputClass} placeholder="DEV Applicant" />
                </label>
                <label>
                  <span className={fieldLabelClass}>Email</span>
                  <input name="email" type="email" required className={dashboardInputClass} placeholder="you+dev@example.com" />
                </label>
              </div>
              <label>
                <span className={fieldLabelClass}>Password (optional)</span>
                <input name="password" type="password" minLength={8} className={dashboardInputClass} placeholder="Leave blank to use a setup link" />
              </label>
              <fieldset>
                <legend className={fieldLabelClass}>Initial nominations (optional)</legend>
                <div className="max-h-64 space-y-3 overflow-y-auto rounded-[18px] border border-white/[0.08] bg-black/20 p-4">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <p className="text-xs font-semibold text-zinc-300">{category.name}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {category.awards.map((award) => (
                          <label key={award.id} className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-zinc-500 hover:text-zinc-200">
                            <input type="checkbox" name="awardIds" value={award.id} className="mt-1 accent-white" />
                            {award.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
              <PremiumButton type="submit"><Plus aria-hidden size={14} /> Create applicant</PremiumButton>
            </form>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                <Scale aria-hidden size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Jury</h2>
                <p className="text-sm text-zinc-500">Sees only submitted DEV nominations in approved categories.</p>
              </div>
            </div>
            <form action={createDevAccountAction} className="mt-6 space-y-4">
              <input type="hidden" name="role" value="JURY" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={fieldLabelClass}>Full name</span>
                  <input name="fullName" required className={dashboardInputClass} placeholder="DEV Judge" />
                </label>
                <label>
                  <span className={fieldLabelClass}>Email</span>
                  <input name="email" type="email" required className={dashboardInputClass} placeholder="judge+dev@example.com" />
                </label>
              </div>
              <label>
                <span className={fieldLabelClass}>Password (optional)</span>
                <input name="password" type="password" minLength={8} className={dashboardInputClass} placeholder="Leave blank to use a setup link" />
              </label>
              <fieldset>
                <legend className={fieldLabelClass}>Approved categories</legend>
                <div className="grid gap-2 rounded-[18px] border border-white/[0.08] bg-black/20 p-4 sm:grid-cols-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-zinc-400 hover:text-white">
                      <input type="checkbox" name="categoryNames" value={category.name} className="mt-1 accent-white" />
                      {category.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <PremiumButton type="submit"><Plus aria-hidden size={14} /> Create jury account</PremiumButton>
            </form>
          </GlassCard>
        </div>
      </DashboardSection>

      <DashboardSection title="Manage DEV accounts" eyebrow={`${accounts.length} isolated account${accounts.length === 1 ? "" : "s"}`}>
        {accounts.length === 0 ? (
          <EmptyState title="No DEV accounts" description="Create an applicant or jury account above." />
        ) : (
          <div className="grid gap-5">
            {accounts.map((account) => {
              const profile = account.applicantProfile ?? account.juryProfile;
              const hasPassword = Boolean(account.passwordHash);
              return (
                <GlassCard key={account.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-[-0.025em] text-white">{profile?.fullName ?? account.email}</h2>
                        <StatusBadge tone="purple">DEV</StatusBadge>
                        <StatusBadge tone="blue">{account.role}</StatusBadge>
                        <StatusBadge tone={account.status === "ACTIVE" ? "green" : account.status === "DISABLED" ? "red" : "amber"}>{account.status}</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{account.email}</p>
                      <p className="mt-2 text-xs text-zinc-600">
                        {hasPassword ? "Password configured" : "Awaiting password setup"}
                        {account.lastSetupEmailDeliveryStatus ? ` · Last email: ${account.lastSetupEmailDeliveryStatus}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {account.status === "ACTIVE" && hasPassword ? <PremiumButton href="/login">Sign in</PremiumButton> : null}
                      <form action={setDevAccountEnabledAction}>
                        <HiddenAccountId id={account.id} />
                        <input type="hidden" name="enabled" value={account.status === "DISABLED" ? "true" : "false"} />
                        <SecondaryButton type="submit">{account.status === "DISABLED" ? "Enable" : "Disable"}</SecondaryButton>
                      </form>
                      <NativeConfirmForm action={deleteDevAccountAction} message={`Delete ${account.email} and all of its DEV data?`}>
                        <HiddenAccountId id={account.id} />
                        <SecondaryButton type="submit" className="border-red-400/20 text-red-300 hover:bg-red-400/10"><Trash2 aria-hidden size={14} /> Delete</SecondaryButton>
                      </NativeConfirmForm>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                    <div className="rounded-[20px] border border-white/[0.08] bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white"><KeyRound aria-hidden size={15} /> Password access</div>
                      <form action={setDevAccountPasswordAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <HiddenAccountId id={account.id} />
                        <input name="password" type="password" minLength={8} required className={dashboardInputClass} placeholder="Set a new password" />
                        <SecondaryButton type="submit">Set password</SecondaryButton>
                      </form>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!hasPassword ? (
                          <>
                            <form action={createDevSetupLinkAction}><HiddenAccountId id={account.id} /><SecondaryButton type="submit">Create setup link</SecondaryButton></form>
                            <form action={sendDevSetupEmailAction}><HiddenAccountId id={account.id} /><SecondaryButton type="submit"><Mail aria-hidden size={14} /> Send setup email</SecondaryButton></form>
                          </>
                        ) : null}
                        <form action={createDevResetLinkAction}><HiddenAccountId id={account.id} /><SecondaryButton type="submit">Create reset link</SecondaryButton></form>
                        <form action={sendDevResetEmailAction}><HiddenAccountId id={account.id} /><SecondaryButton type="submit"><Mail aria-hidden size={14} /> Send reset email</SecondaryButton></form>
                      </div>
                    </div>

                    {account.role === "APPLICANT" && account.applicantProfile ? (
                      <div className="rounded-[20px] border border-white/[0.08] bg-black/20 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white"><UserRound aria-hidden size={15} /> Nominations</div>
                        <div className="mt-3 space-y-2">
                          {account.applicantProfile.nominations.length ? account.applicantProfile.nominations.map((nomination) => (
                            <div key={nomination.id} className="flex items-center justify-between gap-3 rounded-[14px] border border-white/[0.07] bg-white/[0.035] px-3 py-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-zinc-200">{nomination.award.name}</p>
                                <p className="truncate text-[0.66rem] text-zinc-600">{nomination.category.name} · {nomination.status}</p>
                              </div>
                              <form action={removeDevApplicantNominationAction}>
                                <HiddenAccountId id={account.id} />
                                <input type="hidden" name="nominationId" value={nomination.id} />
                                <button type="submit" aria-label={`Remove ${nomination.award.name}`} className="text-zinc-600 hover:text-red-300"><Trash2 aria-hidden size={14} /></button>
                              </form>
                            </div>
                          )) : <p className="text-sm text-zinc-600">No nominations yet.</p>}
                        </div>
                        <form action={addDevApplicantNominationAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <HiddenAccountId id={account.id} />
                          <select name="awardId" required defaultValue="" className={dashboardSelectClass}>
                            <option value="" disabled>Add nomination…</option>
                            {categories.map((category) => (
                              <optgroup key={category.id} label={category.name}>
                                {category.awards.map((award) => <option key={award.id} value={award.id}>{award.name}</option>)}
                              </optgroup>
                            ))}
                          </select>
                          <SecondaryButton type="submit"><Plus aria-hidden size={14} /> Add</SecondaryButton>
                        </form>
                      </div>
                    ) : null}

                    {account.role === "JURY" && account.juryProfile ? (
                      <form action={updateDevJuryCategoriesAction} className="rounded-[20px] border border-white/[0.08] bg-black/20 p-4">
                        <HiddenAccountId id={account.id} />
                        <div className="flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck aria-hidden size={15} /> Approved categories</div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {categories.map((category) => (
                            <label key={category.id} className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-zinc-400 hover:text-white">
                              <input type="checkbox" name="categoryNames" value={category.name} defaultChecked={account.juryProfile?.approvedCategories.includes(category.name)} className="mt-1 accent-white" />
                              {category.name}
                            </label>
                          ))}
                        </div>
                        <SecondaryButton type="submit" className="mt-4">Save categories</SecondaryButton>
                      </form>
                    ) : null}
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
