"use client";

import { useTransition } from "react";
import { UserPlus } from "lucide-react";
import { startApplicantOnboardingFromJury } from "@/features/account/server/jury-applicant-onboarding.actions";

export default function ApplyAsApplicantButton() {
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-[24px] border border-[rgba(114,160,193,0.2)] bg-white/75 p-4 shadow-[0_16px_50px_rgba(37,42,45,0.06)] backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">Apply as an Applicant</p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">Create a separate Applicant account with your details prefilled. Your Jury account and access will stay unchanged.</p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => void startApplicantOnboardingFromJury())}
        className="ibpa-button ibpa-button-primary mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0 sm:w-auto"
      >
        <UserPlus aria-hidden size={16} />
        {pending ? "Preparing…" : "Apply as Applicant"}
      </button>
    </section>
  );
}
