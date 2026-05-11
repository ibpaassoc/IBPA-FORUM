"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="bg-[linear-gradient(160deg,var(--color-navy-deep)_0%,var(--color-navy)_50%,var(--color-navy-mid)_100%)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)] text-center">
        <p className="mx-auto inline-flex items-center gap-[var(--space-sm)] text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-title-accent)]">
          {t.home.cta.label}
        </p>

        <h2 className="mx-auto mt-[var(--space-sm)] max-w-3xl font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light text-white">
          {t.home.cta.title}
        </h2>

        <p className="mx-auto mt-[var(--space-md)] max-w-2xl text-base leading-[1.7] text-[rgba(255,255,255,0.65)]">
          {t.home.cta.text}
        </p>

        <div className="mt-[var(--space-lg)] flex flex-wrap items-center justify-center gap-[var(--space-sm)]">
          <Link
            href="/apply"
            className="ibpa-button ibpa-button-gold"
          >
            {t.common.applyNow}
          </Link>

          <Link
            href="/jury"
            className="ibpa-button ibpa-button-white"
          >
            {t.home.cta.judge}
          </Link>
        </div>
      </div>
    </section>
  );
}
