"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixFaq() {
  const { t } = useLanguage();

  return (
    <PageSection>
      <div className="mb-8 max-w-3xl">
        <p className="page-eyebrow">{t.grandPrixPage.faq.label}</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          {t.grandPrixPage.faq.title}
        </h2>
      </div>

      <div className="space-y-4">
        {t.grandPrixPage.faq.items.map((faq) => (
          <PageCard key={faq.question} className="p-6">
            <p className="text-lg font-semibold text-white">{faq.question}</p>
            <p className="page-copy mt-3 text-sm">{faq.answer}</p>
          </PageCard>
        ))}
      </div>
    </PageSection>
  );
}
