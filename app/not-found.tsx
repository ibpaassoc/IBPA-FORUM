"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

// Global App Router 404. Rendered for any unmatched route and for every
// notFound() call in the app (e.g. the closed /apply/jury route). It sits inside
// the root layout's LanguageProvider, so it localizes via the same useLanguage()
// system as the rest of the site (EN / RU / UA) with no separate i18n setup.
export default function NotFound() {
  const { t } = useLanguage();
  const router = useRouter();
  const nf = t.notFound;

  return (
    <main className="page-shell flex min-h-screen items-center justify-center p-6">
      <div className="premium-glass w-full max-w-md px-8 py-12 text-center">
        <p className="mb-2 font-[var(--font-title-family)] text-[clamp(4.5rem,13vw,7rem)] font-light leading-none tracking-[-0.04em] text-[var(--color-blue)]">
          404
        </p>
        <h1 className="mb-3 text-[1.6rem] leading-tight [font-family:var(--font-accent-family)] text-[var(--color-ink)]">
          {nf.title}
        </h1>
        <p className="mb-8 text-[0.95rem] leading-relaxed text-[var(--color-ink-soft)]">
          {nf.description}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="ibpa-button ibpa-button-blue w-full sm:w-auto">
            {nf.backHome}
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="ibpa-button ibpa-button-ghost w-full sm:w-auto"
          >
            {nf.back}
          </button>
        </div>
      </div>
    </main>
  );
}
