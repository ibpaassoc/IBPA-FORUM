"use client";

import { Globe, KeyRound, LifeBuoy, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  DashboardDetailCard,
  DashboardPageHeader,
  GlassCard,
  SecondaryButton,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";
import LanguageSelector from "./LanguageSelector";

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof ShieldCheck;
  children: React.ReactNode;
}) {
  return (
    <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
      <Icon aria-hidden size={17} className="text-[var(--color-blue)]" />
      {children}
    </h2>
  );
}

/**
 * Client body of the applicant Account Settings page so language changes
 * apply instantly without a reload. Account facts arrive as plain props
 * from the server page.
 */
export default function ApplicantSettingsContent({
  email,
  status,
  createdAtIso,
}: {
  email: string;
  status: string;
  createdAtIso: string;
}) {
  const { language, t } = useLanguage();
  const s = t.account.settings;
  const memberSince = new Intl.DateTimeFormat(language === "ua" ? "uk" : language, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(createdAtIso));

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader label={s.label} title={s.title} description={s.description} />

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5">
          <GlassCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <SectionTitle icon={ShieldCheck}>{s.account}</SectionTitle>
              <StatusBadge tone={status === "ACTIVE" ? "green" : "neutral"}>
                {t.account.statuses[status] ?? status.toLowerCase()}
              </StatusBadge>
            </div>
            <div className="mt-4 grid gap-3">
              <DashboardDetailCard label={s.email} value={email} />
              <DashboardDetailCard label={s.role} value={s.applicant} />
              <DashboardDetailCard label={s.memberSince} value={memberSince} />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionTitle icon={Globe}>{s.language}</SectionTitle>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{s.languageText}</p>
            <div className="mt-4">
              <LanguageSelector ariaLabel={s.languageAria} />
            </div>
          </GlassCard>
        </div>

        <div className="flex flex-col gap-5">
          <GlassCard className="p-5">
            <SectionTitle icon={KeyRound}>{s.password}</SectionTitle>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{s.passwordText}</p>
            <div className="mt-4">
              <SecondaryButton href="/account/forgot-password">{s.sendResetLink}</SecondaryButton>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionTitle icon={LifeBuoy}>{s.otherTitle}</SectionTitle>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{s.otherText}</p>
            <div className="mt-4">
              <a
                href="mailto:forum-support@ibpassociations.org"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
              >
                {s.contactSupport}
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
