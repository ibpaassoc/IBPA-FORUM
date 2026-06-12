"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixCriteria() {
  const { t } = useLanguage();

  return (
    <PageSection className="grid gap-(--space-md) lg:grid-cols-[1.05fr_0.95fr]">
      <PageCard>
        <p className="page-eyebrow">{t.grandPrixPage.criteria.label}</p>
        <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] text-(--color-ink)">
          {t.grandPrixPage.criteria.title}
        </h2>
        <p className="mt-(--space-sm) text-sm leading-[1.7] text-(--color-ink-soft)">
          {t.grandPrixPage.criteria.text}
        </p>
      </PageCard>

      <PageCard>
        <p className="page-eyebrow">
          {t.grandPrixPage.criteria.listLabel}
        </p>
        <div className="mt-(--space-md) space-y-(--space-sm)">
          {t.grandPrixPage.criteria.items.map((item) => (
            <div key={item} className="rounded-sm border border-(--border-default) bg-(--color-off-white) p-(--space-sm)">
              <p className="text-sm leading-[1.65] text-(--color-ink-soft)">{item}</p>
            </div>
          ))}
        </div>
      </PageCard>
    </PageSection>
  );
}
