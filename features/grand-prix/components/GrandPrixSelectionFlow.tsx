"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixSelectionFlow() {
  const { t } = useLanguage();

  return (
    <PageSection>
      <div className="mb-8 max-w-3xl">
        <p className="page-eyebrow">{t.grandPrixPage.flow.label}</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          {t.grandPrixPage.flow.title}
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {t.grandPrixPage.flow.steps.map((step) => (
          <PageCard key={step.number}>
            <p className="page-eyebrow text-[10px]">{step.number}</p>
            <p className="mt-4 text-xl font-semibold text-white">{step.title}</p>
            <p className="page-copy mt-4 text-sm">{step.text}</p>
          </PageCard>
        ))}
      </div>
    </PageSection>
  );
}
