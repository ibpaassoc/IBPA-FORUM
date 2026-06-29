"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import LoginForm from "@/features/auth/components/LoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryLoginContent() {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.auth.loginPage.eyebrow}
      title={t.auth.loginPage.cardTitle}
      description={t.auth.loginPage.cardText}
    >
      <LoginForm />
    </AuthShell>
  );
}
