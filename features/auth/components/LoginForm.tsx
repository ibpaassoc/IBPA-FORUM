"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { inspectLoginAccountAction } from "@/features/auth/server/login.actions";
import { safeNextForRole, type PublicAccountRole } from "@/features/auth/lib/role";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-ink)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover-accent)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]";

const labelClass =
  "block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)]";

export default function LoginForm({ role, next }: { role: PublicAccountRole; next: string }) {
  const [error, setError] = useState("");
  const [switchRole, setSwitchRole] = useState<PublicAccountRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();
  const destination = safeNextForRole(next, role);

  function roleHref(targetRole: PublicAccountRole) {
    const params = new URLSearchParams({ role: targetRole });
    const targetNext = safeNextForRole(next, targetRole);
    if (targetNext !== (targetRole === "jury" ? "/account/jury" : "/account/applicant")) {
      params.set("next", targetNext);
    }
    return `/login?${params.toString()}`;
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    setSwitchRole(null);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const accountState = await inspectLoginAccountAction(email, role);
      if (accountState.error) {
        setError(accountState.error);
        setSwitchRole(accountState.switchRole ?? null);
        setIsSubmitting(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
        callbackUrl: destination,
      });

      if (!result || result.error) {
        setError(t.auth.form.invalidCredentials);
        setIsSubmitting(false);
        return;
      }

      // Use a document navigation so the new NextAuth session cookie is always
      // available to the server-side role redirect on the next request.
      window.location.assign(destination);
    } catch {
      setError(t.auth.form.invalidCredentials);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-[var(--space-md)]">
      <div className="grid grid-cols-2 rounded-[var(--radius-sm)] border border-[rgba(114,160,193,0.24)] bg-[rgba(185,217,235,0.2)] p-1" aria-label="Account type">
        {(["applicant", "jury"] as const).map((item) => (
          <Link
            key={item}
            href={roleHref(item)}
            aria-current={role === item ? "page" : undefined}
            className={`rounded-[calc(var(--radius-sm)-0.2rem)] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.1em] transition ${role === item ? "bg-white text-[var(--color-ink)] shadow-sm" : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"}`}
          >
            {item === "applicant" ? "Applicant" : "Jury"}
          </Link>
        ))}
      </div>
      <form action={handleSubmit} className="space-y-[var(--space-md)]">
      <div>
        <label htmlFor="email" className={`mb-[var(--space-xs)] ${labelClass}`}>
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

      <div>
        <div className="mb-[var(--space-xs)] flex items-center justify-between gap-2">
          <label htmlFor="password" className={labelClass}>
            {t.auth.form.password}
          </label>
          <Link
            href={`/account/forgot-password?role=${role}`}
            className="text-[clamp(0.65rem,0.95vw,0.75rem)] text-[var(--color-hover-accent)] transition hover:text-[var(--color-blue)] hover:underline"
          >
            {t.auth.form.forgotPassword}
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
          placeholder={t.auth.form.passwordPlaceholder}
        />
      </div>

      {error ? (
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-hover-accent)] bg-[rgba(185,217,235,0.26)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)]">
          {error}
          {switchRole ? (
            <button type="button" onClick={() => router.push(roleHref(switchRole))} className="mt-2 block text-sm font-semibold text-[var(--color-blue)] underline">
              Switch to {switchRole === "jury" ? "Jury" : "Applicant"} login
            </button>
          ) : null}
        </div>
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
        <Link
          href={`/account/setup?role=${role}`}
          className="text-[var(--color-hover-accent)] hover:text-[var(--color-blue)] hover:underline"
        >
          Set up account
        </Link>
        .
      </p>
      </form>

    </div>
  );
}
