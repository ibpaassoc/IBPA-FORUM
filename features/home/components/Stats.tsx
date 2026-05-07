"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Stats() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
      <div className="grid gap-[var(--space-md)] md:grid-cols-2 xl:grid-cols-4">
        {t.home.stats.map((item) => (
          <div
            key={item.title}
            className="page-card p-[var(--space-lg)]"
          >
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
              {item.title}
            </p>
            <p className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[var(--color-navy)]">
              {item.value}
            </p>
            <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)]">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
