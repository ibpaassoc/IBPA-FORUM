import Link from "next/link";

export default function AccountProfileUnavailablePage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[var(--color-white)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
      <section className="w-full max-w-[440px] rounded-[var(--radius-lg)] border border-[rgba(114,160,193,0.2)] bg-white p-[clamp(1.25rem,4vw,2rem)] text-center shadow-[0_28px_80px_rgba(37,42,45,0.1)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
          IBPA Account
        </p>
        <h1 className="mt-3 font-[var(--font-display)] text-3xl font-light text-[var(--color-ink)]">
          Your account needs attention
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
          We could not load your applicant profile. Please contact IBPA support so we can restore your account access.
        </p>
        <a
          href="mailto:forum-support@ibpassociations.org"
          className="ibpa-button ibpa-button-primary mt-6 inline-flex"
        >
          Contact support
        </a>
        <Link
          href="/"
          className="mt-4 block text-sm text-[var(--color-hover-accent)] hover:underline"
        >
          Return to the home page
        </Link>
      </section>
    </main>
  );
}
