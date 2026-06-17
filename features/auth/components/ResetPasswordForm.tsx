"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { resetPasswordAction } from "@/features/auth/server/reset-password.actions";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-ink)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover-accent)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]";

const labelClass =
  "mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)]";

export default function ResetPasswordForm({ token }: { token: string }) {
  const { t } = useLanguage();
  const [state, formAction, isPending] = useActionState(resetPasswordAction, undefined);

  if (state?.success) {
    return (
      <div className="mt-[var(--space-lg)] space-y-[var(--space-md)]">
        <div className="rounded-[var(--radius)] border border-[var(--color-hover-accent)] bg-[rgba(185,217,235,0.18)] p-[var(--space-md)]">
          <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-semibold uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">
            Password Updated
          </p>
          <p className="mt-[var(--space-xs)] text-sm leading-[1.7] text-[var(--color-ink)]">
            {t.auth.form.passwordResetSuccess}
          </p>
        </div>
        <Link
          href="/jury/login"
          className="ibpa-button ibpa-button-primary inline-flex w-full"
        >
          {t.auth.form.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-[var(--space-lg)] space-y-[var(--space-md)]">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className={labelClass}>
          {t.auth.form.newPassword}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
          placeholder={t.auth.form.newPasswordPlaceholder}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          {t.auth.form.confirmNewPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
          placeholder={t.auth.form.confirmNewPasswordPlaceholder}
        />
      </div>

      {state?.error ? (
        <p className="rounded-[var(--radius-sm)] border border-[var(--color-hover-accent)] bg-[rgba(185,217,235,0.26)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="ibpa-button ibpa-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t.auth.form.resettingPassword : t.auth.form.resetPassword}
      </button>
    </form>
  );
}
