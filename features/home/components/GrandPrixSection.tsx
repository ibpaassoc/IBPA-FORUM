"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function GrandPrixSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-[var(--color-mist)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <div className="page-card p-[var(--space-lg)]">
          <p className="page-eyebrow">
            {t.home.grandPrix.label}
          </p>

          <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light text-[var(--color-navy)]">
            {t.home.grandPrix.title}
          </h2>

          <p className="mt-[var(--space-md)] text-sm leading-[1.7] text-[var(--color-steel)]">
            {t.home.grandPrix.text1}
          </p>

          <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)]">
            {t.home.grandPrix.text2}
          </p>

          <a
            href="/grand-prix"
            className="ibpa-button ibpa-button-ghost mt-[var(--space-lg)]"
          >
            {t.home.grandPrix.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
