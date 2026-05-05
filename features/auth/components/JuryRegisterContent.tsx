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
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
        {t.auth.registerPage.cardEyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold">
        {t.auth.registerPage.cardTitle}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#d9d4ca]/85">
        {t.auth.registerPage.cardText}
      </p>
      <RegisterForm />
    </AuthShell>
  );
}
