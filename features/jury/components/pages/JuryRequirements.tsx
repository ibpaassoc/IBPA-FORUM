"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryRequirements() {
  const { t } = useLanguage();

  return (
    <section id="requirements" className="bg-[var(--color-mist)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <div className="mb-[var(--space-lg)] max-w-3xl">
          <p className="page-eyebrow">
            {t.juryPage.requirements.label}
          </p>
          <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.15] text-[var(--color-navy)]">
            {t.juryPage.requirements.title}
          </h2>
        </div>

        <div className="grid gap-[var(--space-md)] md:grid-cols-2 xl:grid-cols-4">
          {t.juryPage.requirements.items.map((item) => (
            <div
              key={item.label}
              className="page-card p-[var(--space-md)]"
            >
              <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
                {item.label}
              </p>
              <p className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[var(--color-navy)]">{item.value}</p>
              <p className="mt-[var(--space-sm)] text-sm leading-[1.65] text-[var(--color-steel)]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
