"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixPillars() {
  const { t } = useLanguage();

  return (
    <PageSection className="grid gap-[var(--space-md)] md:grid-cols-3">
      {t.grandPrixPage.pillars.map((item) => (
        <PageCard key={item.title}>
          <p className="page-eyebrow">{item.title}</p>
          <p className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-navy)]">{item.title}</p>
          <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)]">{item.text}</p>
        </PageCard>
      ))}
    </PageSection>
  );
}
