"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import LoginForm from "@/features/auth/components/LoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryLoginContent({
  role,
  next,
}: {
  role: "applicant" | "jury";
  next: string;
}) {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={role === "jury" ? "Jury Login" : "Applicant Login"}
      title={role === "jury" ? "Welcome back" : "Continue your application"}
      description={role === "jury" ? t.auth.loginPage.cardText : "Sign in to manage your IBPA Beauty Award application."}
    >
      <LoginForm role={role} next={next} />
    </AuthShell>
  );
}
