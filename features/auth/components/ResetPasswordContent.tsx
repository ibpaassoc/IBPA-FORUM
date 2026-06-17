"use client";

import Link from "next/link";
import AuthShell from "@/features/auth/components/AuthShell";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type TokenState = "valid" | "invalid" | "expired" | "missing";

export default function ResetPasswordContent({
  token,
  tokenState,
}: {
  token: string;
  tokenState: TokenState;
}) {
  const { t } = useLanguage();

  return (
    <AuthShell
      eyebrow={t.auth.resetPage.eyebrow}
      title={t.auth.resetPage.title}
      description={t.auth.resetPage.description}
    >
      {tokenState === "valid" ? (
        <>
          <h2 className="font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.5rem)] font-normal text-[var(--color-ink)]">
            {t.auth.resetPage.cardTitle}
          </h2>
          <p className="mt-[var(--space-xs)] text-sm leading-[1.65] text-[var(--color-ink-soft)]">
            {t.auth.resetPage.cardText}
          </p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <div className="mt-[var(--space-lg)] space-y-[var(--space-md)]">
          <div className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface-tint)] p-[var(--space-md)]">
            <p className="text-sm leading-[1.7] text-[var(--color-ink)]">
              {tokenState === "expired"
                ? t.auth.form.expiredResetToken
                : t.auth.form.invalidResetToken}
            </p>
          </div>
          <Link
            href="/jury/forgot-password"
            className="ibpa-button ibpa-button-primary inline-flex w-full"
          >
            {t.auth.form.sendResetLink}
          </Link>
          <Link
            href="/jury/login"
            className="block text-center text-sm text-[var(--color-ink-soft)] transition hover:text-[var(--color-hover-accent)]"
          >
            ← {t.auth.form.backToLogin}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
