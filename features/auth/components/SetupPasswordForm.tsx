"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  setupPasswordAction,
  type SetupPasswordState,
} from "@/features/auth/server/setup.actions";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-ink)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover-accent)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]";

export default function SetupPasswordForm({
  token,
  tokenState,
}: {
  token: string;
  tokenState: "missing" | "invalid" | "expired" | "valid";
}) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [state, action, pending] = useActionState<SetupPasswordState | undefined, FormData>(
    setupPasswordAction,
    undefined
  );

  useEffect(() => {
    if (!state?.success || redirecting) return;

    setRedirecting(true);
    const timer = setTimeout(() => {
      router.replace("/account/login");
      router.refresh();
    }, 1500);

    return () => clearTimeout(timer);
  }, [redirecting, router, state]);

  if (tokenState !== "valid") {
    const message =
      tokenState === "expired"
        ? "This setup link has expired."
        : tokenState === "missing"
          ? "A setup token is required."
          : "This setup link is invalid or has already been used.";

    return (
      <div className="space-y-[var(--space-md)]">
        <p className="rounded-[var(--radius-sm)] border border-[var(--color-hover-accent)] bg-[rgba(185,217,235,0.26)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)]">
          {message}
        </p>
        <Link href="/account/forgot-password" className="ibpa-button ibpa-button-primary w-full">
          Request a new link
        </Link>
      </div>
    );
  }

  const done = Boolean(state?.success) || redirecting;

  return (
    <form action={action} className="space-y-[var(--space-md)]">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          disabled={done}
          autoComplete="new-password"
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-[var(--space-xs)] block text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)]">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          disabled={done}
          autoComplete="new-password"
          className={inputClass}
          placeholder="Repeat password"
        />
      </div>

      {done ? (
        <p className="rounded-[var(--radius-sm)] border border-[var(--color-hover-accent)] bg-[rgba(185,217,235,0.26)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)]">
          Account activated. Redirecting you to the login page…
        </p>
      ) : (state?.error || state?.invalidToken || state?.expiredToken) ? (
        <p className="rounded-[var(--radius-sm)] border border-[var(--color-hover-accent)] bg-[rgba(185,217,235,0.26)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)]">
          {state.error ?? (state.expiredToken ? "This link has expired." : "This link is invalid or has already been used.")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || done}
        className="ibpa-button ibpa-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {done ? "Account activated" : pending ? "Activating..." : "Activate account"}
      </button>
    </form>
  );
}
