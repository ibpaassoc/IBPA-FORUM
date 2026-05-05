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
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#f1ecde]">
          {t.auth.form.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={state?.email ?? ""}
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder={t.auth.form.emailPlaceholder}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#f1ecde]">
          {t.auth.form.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          ref={passwordRef}
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder={t.auth.form.passwordRegisterPlaceholder}
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-[#f1ecde]"
        >
          {t.auth.form.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder={t.auth.form.confirmPasswordPlaceholder}
        />
      </div>

      {state?.error ? (
        <p className="rounded-2xl border border-[#a64b4b]/45 bg-[#4d1d1d]/35 px-4 py-3 text-sm text-[#f8efef]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || state?.success}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? t.auth.form.creatingAccount
          : state?.success
            ? t.auth.form.openingSite
            : t.auth.form.register}
      </button>

      <p className="text-sm leading-6 text-[#d9d4ca]/85">
        {t.auth.form.haveAccount}{" "}
        <Link href="/jury/login" className="text-[#d8c27a] hover:text-[#f0e0a6]">
          {t.auth.form.backToLogin}
        </Link>
        .
      </p>
    </form>
  );
}
