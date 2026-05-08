"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixFaq() {
  const { t } = useLanguage();

  return (
    <PageSection>
      <div className="mb-[var(--space-lg)] max-w-3xl">
        <p className="page-eyebrow">{t.grandPrixPage.faq.label}</p>
        <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light text-[var(--color-navy)]">
          {t.grandPrixPage.faq.title}
        </h2>
      </div>

      <div className="space-y-[var(--space-sm)]">
        {t.grandPrixPage.faq.items.map((faq) => (
          <PageCard key={faq.question}>
            <p className="font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-navy)]">{faq.question}</p>
            <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)]">{faq.answer}</p>
          </PageCard>
        ))}
      </div>
    </PageSection>
  );
}
