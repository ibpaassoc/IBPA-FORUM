"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useActionState } from "react";
import {
  registerAccountAction,
  type RegisterState,
} from "@/features/auth/server/register.actions";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function RegisterForm() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const signingInRef = useRef(false);
  const router = useRouter();
  const { t } = useLanguage();
  const [state, action, pending] = useActionState<RegisterState | undefined, FormData>(
    registerAccountAction,
    undefined
  );

  useEffect(() => {
    if (!state?.success || !state.email || signingInRef.current) {
      return;
    }

    const password = passwordRef.current?.value ?? "";

    if (!password) {
      return;
    }

    signingInRef.current = true;

    void (async () => {
      const result = await signIn("credentials", {
        email: state.email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (!result || result.error) {
        signingInRef.current = false;
        router.refresh();
        return;
      }

      router.replace("/");
      router.refresh();
    })();
  }, [router, state]);

  return (
    <form action={action} className="mt-[var(--space-lg)] space-y-[var(--space-md)]">
      <div>
        <label htmlFor="email" className="mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-navy)]">
          {t.auth.form.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={state?.email ?? ""}
          className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-navy)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]"
          placeholder={t.auth.form.emailPlaceholder}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-navy)]">
          {t.auth.form.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          ref={passwordRef}
          className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-navy)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]"
          placeholder={t.auth.form.passwordRegisterPlaceholder}
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-navy)]"
        >
          {t.auth.form.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-navy)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]"
          placeholder={t.auth.form.confirmPasswordPlaceholder}
        />
      </div>

      {state?.error ? (
        <p className="rounded-[var(--radius-sm)] border border-[var(--color-hover)] bg-[rgba(185,217,235,0.26)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-navy)]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || state?.success}
        className="ibpa-button ibpa-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? t.auth.form.creatingAccount
          : state?.success
            ? t.auth.form.openingSite
            : t.auth.form.register}
      </button>

      <p className="text-sm leading-6 text-[var(--color-steel)]">
        {t.auth.form.haveAccount}{" "}
        <Link href="/jury/login" className="text-[var(--color-hover)] hover:text-[var(--color-navy)]">
          {t.auth.form.backToLogin}
        </Link>
        .
      </p>
    </form>
  );
}
