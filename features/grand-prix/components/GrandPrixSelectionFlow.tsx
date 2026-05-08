"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixSelectionFlow() {
  const { t } = useLanguage();

  return (
    <div className="bg-(--color-white)">
        <PageSection>
            <div className="mb-(--space-lg) max-w-3xl">
                <p className="page-eyebrow">{t.grandPrixPage.flow.label}</p>
                <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] text-(--color-navy)">
                {t.grandPrixPage.flow.title}
                </h2>
            </div>

            <div className="grid gap-(--space-md) lg:grid-cols-4">
                {t.grandPrixPage.flow.steps.map((step) => (
                <PageCard key={step.number}>
                    <p className="page-eyebrow">{step.number}</p>
                    <p className="mt-(--space-sm) font-(--font-display) text-[clamp(1.1rem,2vw,1.6rem)] text-(--color-navy)">{step.title}</p>
                    <p className="mt-(--space-sm) text-sm leading-[1.7] text-(--color-steel)">{step.text}</p>
                </PageCard>
                ))}
            </div>
        </PageSection>
    </div>
  );
}
