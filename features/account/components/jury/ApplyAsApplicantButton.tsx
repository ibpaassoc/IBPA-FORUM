import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function ApplyAsApplicantButton() {
  return (
    <section className="rounded-[24px] border border-[rgba(114,160,193,0.2)] bg-white/75 p-4 shadow-[0_16px_50px_rgba(37,42,45,0.06)] backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">Apply as an Applicant</p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">Start the standard application flow. Your Jury account and access will stay unchanged.</p>
      </div>
      <Link
        href="/apply"
        className="ibpa-button ibpa-button-primary mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0 sm:w-auto"
      >
        <UserPlus aria-hidden size={16} />
        Apply as Applicant
      </Link>
    </section>
  );
}
