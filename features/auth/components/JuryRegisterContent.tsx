"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryRegisterContent() {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.auth.registerPage.eyebrow}
      title={t.auth.registerPage.title}
      description={t.auth.registerPage.description}
    >
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">
        {t.auth.registerPage.cardEyebrow}
      </p>
      <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-ink)]">
        {t.auth.registerPage.cardTitle}
      </h2>
      <p className="mt-[var(--space-sm)] text-sm leading-[1.65] text-[var(--color-ink-soft)]">
        {t.auth.registerPage.cardText}
      </p>
      <RegisterForm />
    </AuthShell>
  );
}
