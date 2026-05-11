"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (!result || result.error) {
      if (result?.error === "No account is registered with this email.") {
        setError(t.auth.form.noRegisteredAccount);
      } else {
        setError(t.auth.form.invalidCredentials);
      }
      setIsSubmitting(false);
      return;
    }

    router.replace("/jury/dashboard");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="mt-[var(--space-lg)] space-y-[var(--space-md)]">
      <div>
        <label htmlFor="email" className="mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)]">
          {t.auth.form.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-ink)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]"
          placeholder={t.auth.form.emailPlaceholder}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)]">
          {t.auth.form.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-ink)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]"
          placeholder={t.auth.form.passwordPlaceholder}
        />
      </div>

      {error ? (
        <p className="rounded-[var(--radius-sm)] border border-[var(--color-hover)] bg-[rgba(185,217,235,0.26)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="ibpa-button ibpa-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t.auth.form.openingSite : t.auth.form.login}
      </button>

      <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
        {t.auth.form.noAccount}{" "}
        <Link href="/jury/register" className="text-[var(--color-hover)] hover:text-[var(--color-blue)] hover:underline">
          {t.auth.form.register}
        </Link>
        .
      </p>
    </form>
  );
}
