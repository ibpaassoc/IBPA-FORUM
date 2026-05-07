"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageHero } from "@/shared/components/layout/PageShell";

export default function CategoriesHero() {
  const { t } = useLanguage();

  return (
    <PageHero
      eyebrow={t.categoriesPage.hero.eyebrow}
      title={t.categoriesPage.hero.title}
      description={t.categoriesPage.hero.description}
      aside={
        <div className="space-y-4">
          <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
            {t.categoriesPage.hero.entryRules}
          </p>
          <div className="rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.07)] p-[var(--space-md)]">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
              {t.categoriesPage.hero.feeLabel}
            </p>
            <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-light">
              {t.categoriesPage.hero.feeValue}
            </p>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.07)] p-[var(--space-md)]">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
              {t.categoriesPage.hero.eligibilityLabel}
            </p>
            <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal">
              {t.categoriesPage.hero.eligibilityValue}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap gap-4">
        <Link
          href="/apply"
          className="ibpa-button ibpa-button-gold"
        >
          {t.categoriesPage.hero.cta}
        </Link>
      </div>
    </PageHero>
  );
}
