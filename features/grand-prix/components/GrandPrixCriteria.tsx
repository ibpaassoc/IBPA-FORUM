"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function GrandPrixCriteria() {
  const { t } = useLanguage();

  return (
    <PageSection className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <PageCard className="p-8">
        <p className="page-eyebrow text-[10px]">{t.grandPrixPage.criteria.label}</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          {t.grandPrixPage.criteria.title}
        </h2>
        <p className="page-copy mt-4 text-sm">
          {t.grandPrixPage.criteria.text}
        </p>
      </PageCard>

      <PageCard className="p-8">
        <p className="page-eyebrow text-[10px]">
          {t.grandPrixPage.criteria.listLabel}
        </p>
        <div className="mt-5 space-y-4">
          {t.grandPrixPage.criteria.items.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm leading-6 text-[#d9d4ca]">{item}</p>
            </div>
          ))}
        </div>
      </PageCard>
    </PageSection>
  );
}
