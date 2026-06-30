"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryRegisterContent() {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.auth.registerPage.eyebrow}
      title={t.auth.registerPage.cardTitle}
      description={t.auth.registerPage.cardText}
    >
      <RegisterForm />
    </AuthShell>
  );
}
