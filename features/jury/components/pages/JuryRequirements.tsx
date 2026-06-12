"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryRequirements() {
  const { t } = useLanguage();

  return (
    <section id="requirements" >
      <div className="mx-auto max-w-(--content-width) px-(--page-gutter) page-section-pad">
        <div className="mb-(--space-lg) max-w-3xl">
          <p className="page-eyebrow">
            {t.juryPage.requirements.label}
          </p>
          <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.15] text-(--color-ink)">
            {t.juryPage.requirements.title}
          </h2>
        </div>

        <div className="grid gap-(--space-md) md:grid-cols-2 xl:grid-cols-4 font-light">
          {t.juryPage.requirements.items.map((item) => (
            <div
              key={item.label}
              className="page-card p-(--space-md)"
            >
              <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-(--color-hover-accent)">
                {item.label}
              </p>
              <p className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,4vw,2.8rem)] text-(--color-ink)">
                {item.value}
              </p>
              <p className="mt-(--space-sm) text-sm leading-[1.65] text-(--color-ink-soft)">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
