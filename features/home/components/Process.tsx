"use client";

import SectionTitle from "@/shared/components/ui/SectionTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Process() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-[var(--content-width)] bg-[var(--color-off-white)] px-[var(--page-gutter)] page-section-pad">
      <SectionTitle
        label={t.home.process.label}
        title={t.home.process.title}
        className="max-w-2xl"
      />

      <div className="relative mt-[var(--space-xl)] grid gap-[var(--space-md)] lg:grid-cols-5">
        {t.home.process.steps.map((step) => (
          <div
            key={step.number}
            className="premium-glass p-[var(--space-md)] text-center"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] text-sm font-medium tracking-widest text-[var(--color-blue)] transition">
              {step.number}
            </div>
            <h3 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] text-[var(--color-ink)]">
              {step.title}
            </h3>
            <p className="mt-[var(--space-sm)] text-sm leading-[1.65] text-[var(--color-ink-soft)]">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
