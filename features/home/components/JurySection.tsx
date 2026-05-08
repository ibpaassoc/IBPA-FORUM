"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JurySection() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-(--content-width) px-(--page-gutter) page-section-pad">
      <div className="page-card p-(--space-lg)">
        <p className="page-eyebrow">
          {t.home.juryCta.label}
        </p>

        <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] text-(--color-navy)">
          {t.home.juryCta.title}
        </h2>

        <p className="mt-(--space-md) text-sm leading-[1.7] text-(--color-steel)">
          {t.home.juryCta.text1}
        </p>

        <p className="mt-(--space-sm) text-sm leading-[1.7] text-(--color-steel)">
          {t.home.juryCta.text2}
        </p>

        <p className="mt-(--space-sm) text-sm leading-[1.7] text-(--color-steel)">
          {t.home.juryCta.text3}
        </p>

        <a
          href="/jury"
          className="ibpa-button ibpa-button-gold mt-(--space-lg)"
        >
          {t.home.juryCta.button}
        </a>
      </div>
    </section>
  );
}
