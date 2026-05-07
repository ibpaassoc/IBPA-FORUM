"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JurySection() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
      <div className="page-card p-[var(--space-lg)]">
        <p className="page-eyebrow">
          {t.home.juryCta.label}
        </p>

        <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light text-[var(--color-navy)]">
          {t.home.juryCta.title}
        </h2>

        <p className="mt-[var(--space-md)] text-sm leading-[1.7] text-[var(--color-steel)]">
          {t.home.juryCta.text1}
        </p>

        <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)]">
          {t.home.juryCta.text2}
        </p>

        <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)]">
          {t.home.juryCta.text3}
        </p>

        <a
          href="/jury"
          className="ibpa-button ibpa-button-gold mt-[var(--space-lg)]"
        >
          {t.home.juryCta.button}
        </a>
      </div>
    </section>
  );
}
