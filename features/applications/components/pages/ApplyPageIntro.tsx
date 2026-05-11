"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ApplyPageIntro() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto mb-[var(--space-lg)] max-w-3xl rounded-t-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-blue-wash)] px-[var(--space-xl)] py-[var(--space-lg)]">
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-title-accent)]">
        {t.applyPage.intro.eyebrow}
      </p>
      <h1 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-[1.1] text-[var(--color-ink)]">
        {t.applyPage.intro.title}
      </h1>
      <p className="mt-[var(--space-sm)] max-w-2xl text-sm leading-[1.7] text-[var(--color-ink-soft)] sm:text-base">
        {t.applyPage.intro.text}
      </p>
    </div>
  );
}
