"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function GrandPrixSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-(--color-white)">
      <div className="mx-auto max-w-(--content-width) px-(--page-gutter) page-section-pad">
        <div className="page-card p-(--space-lg)">
          <p className="page-eyebrow">
            {t.home.grandPrix.label}
          </p>

          <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] text-(--color-ink)">
            {t.home.grandPrix.title}
          </h2>

          <p className="mt-(--space-md) text-sm leading-[1.7] text-(--color-ink-soft)">
            {t.home.grandPrix.text1}
          </p>

          <p className="mt-(--space-sm) text-sm leading-[1.7] text-(--color-ink-soft)">
            {t.home.grandPrix.text2}
          </p>

          <a
            href="/grand-prix"
            className="ibpa-button ibpa-button-ghost mt-(--space-lg)"
          >
            {t.home.grandPrix.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
