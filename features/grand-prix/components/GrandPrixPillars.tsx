"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixPillars() {
  const { t } = useLanguage();

  return (
    <PageSection className="grid gap-4 md:grid-cols-3">
      {t.grandPrixPage.pillars.map((item) => (
        <PageCard key={item.title}>
          <p className="page-eyebrow text-[10px]">{item.title}</p>
          <p className="mt-4 text-2xl font-semibold text-white">{item.title}</p>
          <p className="page-copy mt-4 text-sm">{item.text}</p>
        </PageCard>
      ))}
    </PageSection>
  );
}
