"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ForgotPasswordContent() {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.auth.forgotPage.eyebrow}
      title={t.auth.forgotPage.cardTitle}
      description={t.auth.forgotPage.cardText}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
