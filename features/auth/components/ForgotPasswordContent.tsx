"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ForgotPasswordContent() {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.auth.forgotPage.eyebrow}
      title={t.auth.forgotPage.title}
      description={t.auth.forgotPage.description}
    >
      <h2 className="font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.5rem)] font-normal text-[var(--color-ink)]">
        {t.auth.forgotPage.cardTitle}
      </h2>
      <p className="mt-[var(--space-xs)] text-sm leading-[1.65] text-[var(--color-ink-soft)]">
        {t.auth.forgotPage.cardText}
      </p>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
