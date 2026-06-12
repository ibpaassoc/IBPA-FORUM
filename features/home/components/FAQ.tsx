"use client";

import SectionTitle from "@/shared/components/ui/SectionTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function FAQ() {
  const { t } = useLanguage();

  return (
    <section className="bg-[var(--color-white)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <SectionTitle
          label={t.home.faq.label}
          title={t.home.faq.title}
          className="max-w-2xl"
        />

        <div className="mt-[var(--space-xl)] grid gap-[var(--space-md)] lg:grid-cols-2">
          {t.home.faq.items.map((item) => (
            <div
              key={item.q}
              className="page-card p-[var(--space-lg)]"
            >
              <h3 className="font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-ink)]">{item.q}</h3>
              <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-ink-soft)]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
