"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryProcess() {
  const { t } = useLanguage();

  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <div className="mb-[var(--space-lg)] max-w-3xl">
          <p className="page-eyebrow">
            {t.juryPage.process.label}
          </p>
          <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.15] text-[var(--color-navy)]">
            {t.juryPage.process.title}
          </h2>
        </div>

        <div className="grid gap-[var(--space-md)] lg:grid-cols-5">
          {t.juryPage.process.steps.map((step) => (
            <div
              key={step.number}
              className="page-card p-[var(--space-md)]"
            >
              <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
                {step.number}
              </p>
              <h3 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-navy)]">{step.title}</h3>
              <p className="mt-[var(--space-sm)] text-sm leading-[1.65] text-[var(--color-steel)]">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
