"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageHero } from "@/shared/components/layout/PageShell";

export default function GrandPrixHero() {
  const { t } = useLanguage();

  return (
    <PageHero
      eyebrow={t.grandPrixPage.hero.eyebrow}
      title={t.grandPrixPage.hero.title}
      description={t.grandPrixPage.hero.description}
      aside={
        <div className="space-y-4">
          <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
            {t.grandPrixPage.hero.snapshot}
          </p>
          <div className="rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.07)] p-[var(--space-md)]">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
              {t.grandPrixPage.hero.eligibility}
            </p>
            <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal">
              {t.grandPrixPage.hero.eligibilityValue}
            </p>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.07)] p-[var(--space-md)]">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
              {t.grandPrixPage.hero.evaluation}
            </p>
            <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-light">
              {t.grandPrixPage.hero.evaluationValue}
            </p>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.07)] p-[var(--space-md)]">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
              {t.grandPrixPage.hero.decision}
            </p>
            <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal">
              {t.grandPrixPage.hero.decisionValue}
            </p>
          </div>
        </div>
      }
    >
      <p className="mb-[var(--space-lg)] max-w-2xl text-sm leading-[1.7] text-[rgba(255,255,255,0.65)]">
        {t.grandPrixPage.hero.body}
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/categories"
          className="ibpa-button ibpa-button-white"
        >
          {t.grandPrixPage.hero.cta}
        </Link>
      </div>
    </PageHero>
  );
}
