"use client";

import Link from "next/link";
import { useActionState } from "react";
import JuryRegisterForm from "@/features/jury/components/auth/JuryRegisterForm";
import {
  checkJuryRegistrationEmailAction,
  initialJuryRegistrationState,
} from "@/features/jury/server/register.actions";

export default function JuryEmailCheckForm({
  defaultEmail,
}: {
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState(
    checkJuryRegistrationEmailAction,
    initialJuryRegistrationState
  );

  if (state.step === "password" && state.email) {
    return <JuryRegisterForm state={state} />;
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#f1ecde]">
          Jury application email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail ?? state.email ?? ""}
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder="Enter the email used for approval and payment"
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-[#a64b4b]/45 bg-[#4d1d1d]/35 px-4 py-3 text-sm text-[#f8efef]">
          {state.error}
        </p>
      ) : null}

      {state.notice ? (
        <p className="rounded-2xl border border-[#d8c27a]/35 bg-[#d8c27a]/10 px-4 py-3 text-sm text-white">
          {state.notice}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Checking Eligibility..." : "Continue to Registration"}
      </button>

      {state.notice?.includes("already registered") ? (
        <p className="text-sm leading-6 text-[#d9d4ca]/85">
          Ready to continue?{" "}
          <Link
            href={`/jury/login${state.email ? `?email=${encodeURIComponent(state.email)}` : ""}`}
            className="text-[#d8c27a] hover:text-[#f0e0a6]"
          >
            Open jury login
          </Link>
          .
        </p>
      ) : null}
    </form>
  );
}
