"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useActionState } from "react";
import { createJuryAccountAction } from "@/features/jury/server/register.actions";
import type { JuryRegistrationState } from "@/features/jury/server/register.types";

export default function JuryRegisterForm({
  state,
}: {
  state: JuryRegistrationState;
}) {
  const passwordRef = useRef<HTMLInputElement>(null);
  const signingInRef = useRef(false);
  const [formState, action, pending] = useActionState(createJuryAccountAction, state);

  useEffect(() => {
    if (!formState.success || !formState.email || signingInRef.current) {
      return;
    }

    const password = passwordRef.current?.value ?? "";

    if (!password) {
      return;
    }

    signingInRef.current = true;

    void signIn("credentials", {
      email: formState.email,
      password,
      callbackUrl: "/jury/dashboard",
    });
  }, [formState]);

  if (formState.step === "email") {
    return (
      <div className="mt-8 space-y-5">
        {formState.error ? (
          <p className="rounded-2xl border border-[#a64b4b]/45 bg-[#4d1d1d]/35 px-4 py-3 text-sm text-[#f8efef]">
            {formState.error}
          </p>
        ) : null}

        {formState.notice ? (
          <p className="rounded-2xl border border-[#d8c27a]/35 bg-[#d8c27a]/10 px-4 py-3 text-sm text-white">
            {formState.notice}
          </p>
        ) : null}

        <p className="text-sm leading-6 text-[#d9d4ca]/85">
          Continue from the jury login page if this email already has access.
        </p>

        <Link
          href={`/jury/login${formState.email ? `?email=${encodeURIComponent(formState.email)}` : ""}`}
          className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093]"
        >
          Open Jury Login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="email" value={formState.email ?? state.email ?? ""} />

      <div className="rounded-2xl border border-[#d8c27a]/35 bg-[#d8c27a]/10 px-4 py-3 text-sm text-white">
        Payment verified for <span className="font-semibold">{formState.email}</span>.
        Create your jury password below.
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#f1ecde]">
          Create password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          ref={passwordRef}
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-[#f1ecde]"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder="Repeat your password"
        />
      </div>

      {formState.error ? (
        <p className="rounded-2xl border border-[#a64b4b]/45 bg-[#4d1d1d]/35 px-4 py-3 text-sm text-[#f8efef]">
          {formState.error}
        </p>
      ) : null}

      {formState.notice ? (
        <p className="rounded-2xl border border-[#d8c27a]/35 bg-[#d8c27a]/10 px-4 py-3 text-sm text-white">
          {formState.notice}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || formState.success}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating Access..." : formState.success ? "Opening Dashboard..." : "Create Jury Account"}
      </button>

      <p className="text-sm leading-6 text-[#d9d4ca]/85">
        Already registered?{" "}
        <Link href="/jury/login" className="text-[#d8c27a] hover:text-[#f0e0a6]">
          Log in here
        </Link>
        .
      </p>
    </form>
  );
}
