"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixCriteria() {
  const { t } = useLanguage();

  return (
    <PageSection className="grid gap-[var(--space-md)] lg:grid-cols-[1.05fr_0.95fr]">
      <PageCard>
        <p className="page-eyebrow">{t.grandPrixPage.criteria.label}</p>
        <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] text-[var(--color-ink)]">
          {t.grandPrixPage.criteria.title}
        </h2>
        <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-ink-soft)]">
          {t.grandPrixPage.criteria.text}
        </p>
      </PageCard>

      <PageCard>
        <p className="page-eyebrow">
          {t.grandPrixPage.criteria.listLabel}
        </p>
        <div className="mt-[var(--space-md)] space-y-[var(--space-sm)]">
          {t.grandPrixPage.criteria.items.map((item) => (
            <div key={item} className="rounded-sm border border-[var(--border-default)] bg-[var(--color-off-white)] p-[var(--space-sm)]">
              <p className="text-sm leading-[1.65] text-[var(--color-ink-soft)]">{item}</p>
            </div>
          ))}
        </div>
      </PageCard>
    </PageSection>
  );
}
