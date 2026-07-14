import { KeyRound, LifeBuoy, ShieldCheck } from "lucide-react";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { formatDateLabel } from "@/features/account/components/nomination-presentation";
import {
  DashboardDetailCard,
  DashboardPageHeader,
  GlassCard,
  SecondaryButton,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

export default async function ApplicantSettingsPage() {
  const { account } = await requireApplicantAccount();

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Applicant account"
        title="Account settings"
        description="Your sign-in and account details. Nomination and profile information live on their own pages."
      />

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
              <ShieldCheck aria-hidden size={17} className="text-[var(--color-blue)]" />
              Account
            </h2>
            <StatusBadge tone={account.status === "ACTIVE" ? "green" : "neutral"}>
              {account.status.toLowerCase()}
            </StatusBadge>
          </div>
          <div className="mt-4 grid gap-3">
            <DashboardDetailCard label="Email" value={account.email} />
            <DashboardDetailCard label="Role" value="Applicant" />
            <DashboardDetailCard label="Member since" value={formatDateLabel(account.createdAt)} />
          </div>
        </GlassCard>

        <div className="flex flex-col gap-5">
          <GlassCard className="p-5">
            <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
              <KeyRound aria-hidden size={17} className="text-[var(--color-blue)]" />
              Password
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
              To change your password we send a secure reset link to your email address.
            </p>
            <div className="mt-4">
              <SecondaryButton href="/account/forgot-password">Send reset link</SecondaryButton>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
              <LifeBuoy aria-hidden size={17} className="text-[var(--color-blue)]" />
              Need to change something else?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
              Email changes and account removal are handled by our team so your nominations and
              tickets stay correctly linked.
            </p>
            <div className="mt-4">
              <a
                href="mailto:forum-support@ibpassociations.org"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
              >
                Contact support
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
