"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import LoginForm from "@/features/auth/components/LoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryLoginContent() {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.auth.loginPage.eyebrow}
      title={t.auth.loginPage.title}
      description={t.auth.loginPage.description}
    >
      <h2 className="font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.5rem)] font-normal text-[var(--color-ink)]">
        {t.auth.loginPage.cardTitle}
      </h2>
      <p className="mt-[var(--space-xs)] text-sm leading-[1.65] text-[var(--color-ink-soft)]">
        {t.auth.loginPage.cardText}
      </p>
      <LoginForm />
    </AuthShell>
  );
}
