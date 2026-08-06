"use client";

import Link from "next/link";
import AuthShell from "@/features/auth/components/AuthShell";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type TokenState = "valid" | "invalid" | "expired" | "missing";

export default function ResetPasswordContent({
  token,
  tokenState,
  role,
}: {
  token: string;
  tokenState: TokenState;
  role: "applicant" | "jury";
}) {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.auth.resetPage.eyebrow}
      title={t.auth.resetPage.cardTitle}
      description={t.auth.resetPage.cardText}
    >
      {tokenState === "valid" ? (
        <ResetPasswordForm token={token} role={role} />
      ) : (
        <div className="space-y-[var(--space-md)]">
          <div className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface-tint)] p-[var(--space-md)]">
            <p className="text-sm leading-[1.7] text-[var(--color-ink)]">
              {tokenState === "expired"
                ? t.auth.form.expiredResetToken
                : t.auth.form.invalidResetToken}
            </p>
          </div>
          <Link
            href={`/account/forgot-password?role=${role}`}
            className="ibpa-button ibpa-button-primary inline-flex w-full"
          >
            {t.auth.form.sendResetLink}
          </Link>
          <Link
            href={`/login?role=${role}`}
            className="block text-center text-sm text-[var(--color-ink-soft)] transition hover:text-[var(--color-hover-accent)]"
          >
            ← {t.auth.form.backToLogin}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
