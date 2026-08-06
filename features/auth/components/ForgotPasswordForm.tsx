"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { forgotPasswordAction } from "@/features/auth/server/forgot-password.actions";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-ink)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover-accent)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]";

export default function ForgotPasswordForm({ role }: { role: "applicant" | "jury" }) {
  const { t } = useLanguage();
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, undefined);

  if (state?.sent) {
    return (
      <div className="space-y-[var(--space-md)]">
        <div className="rounded-[var(--radius)] border border-[var(--color-hover-accent)] bg-[rgba(185,217,235,0.18)] p-[var(--space-md)]">
          <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-semibold uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">
            {t.auth.form.checkYourEmail}
          </p>
          <p className="mt-[var(--space-xs)] text-sm leading-[1.7] text-[var(--color-ink)]">
            {t.auth.form.checkYourEmailText}
          </p>
        </div>
        <Link
          href={`/login?role=${role}`}
          className="block text-sm text-[var(--color-hover-accent)] transition hover:text-[var(--color-blue)] hover:underline"
        >
          ← {t.auth.form.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-[var(--space-md)]">
      <input type="hidden" name="role" value={role} />
      <div>
        <label
          htmlFor="email"
          className="mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)]"
        >
          {t.auth.form.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder={t.auth.form.emailPlaceholder}
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
        {isPending ? t.auth.form.sendingLink : t.auth.form.sendResetLink}
      </button>

      <Link
        href={`/login?role=${role}`}
        className="block text-center text-sm text-[var(--color-ink-soft)] transition hover:text-[var(--color-hover-accent)]"
      >
        ← {t.auth.form.backToLogin}
      </Link>
    </form>
  );
}
