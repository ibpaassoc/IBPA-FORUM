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
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
        {t.auth.loginPage.cardEyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold">
        {t.auth.loginPage.cardTitle}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#d9d4ca]/85">
        {t.auth.loginPage.cardText}
      </p>
      <LoginForm />
    </AuthShell>
  );
}
