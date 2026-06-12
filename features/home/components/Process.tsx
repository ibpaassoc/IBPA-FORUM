"use client";

import SectionTitle from "@/shared/components/ui/SectionTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Process() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-(--content-width) bg-(--color-off-white) px-(--page-gutter) page-section-pad">
      <SectionTitle
        label={t.home.process.label}
        title={t.home.process.title}
        className="max-w-2xl"
      />

      <div className="relative mt-(--space-xl) grid gap-(--space-md) lg:grid-cols-5">
        {t.home.process.steps.map((step) => (
          <div
            key={step.number}
            className="page-card p-(--space-md) text-center"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-(--border-default) bg-(--color-white) text-sm font-medium tracking-widest text-(--color-hover-accent) transition">
              {step.number}
            </div>
            <h3 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.1rem,2vw,1.6rem)] text-(--color-ink)">
              {step.title}
            </h3>
            <p className="mt-(--space-sm) text-sm leading-[1.65] text-(--color-ink-soft)">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
