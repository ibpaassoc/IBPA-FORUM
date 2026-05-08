"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageHero } from "@/shared/components/layout/PageShell";

export default function JuryHero() {
  const { t } = useLanguage();

  return (
    <PageHero
      eyebrow={t.juryPage.hero.eyebrow}
      title={t.juryPage.hero.title}
      description={t.juryPage.hero.description}
      aside={
        <div className="space-y-4">
          <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-(--color-gold)">
            {t.juryPage.hero.overview}
          </p>

          <div className="rounded-sm border border-border-footer bg-[rgba(255,255,255,0.07)] p-(--space-md) font-light">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
              {t.juryPage.hero.experience}
            </p>
            <p className="mt-(--space-xs) font-(--font-display) text-[clamp(1.8rem,4vw,2.8rem)]">
              {t.juryPage.hero.experienceValue}
            </p>
          </div>

          <div className="rounded-sm border border-border-footer bg-[rgba(255,255,255,0.07)] p-(--space-md) font-light">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
              {t.juryPage.hero.review}
            </p>
            <p className="mt-(--space-xs) font-(--font-display) text-[clamp(1.8rem,4vw,2.8rem)]">
              {t.juryPage.hero.reviewValue}
            </p>
          </div>

          <div className="rounded-sm border border-border-footer bg-[rgba(255,255,255,0.07)] p-(--space-md) font-light">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
              {t.juryPage.hero.fee}
            </p>
            <p className="mt-(--space-xs) font-(--font-display) text-[clamp(1.8rem,4vw,2.8rem)]">
              {t.juryPage.hero.feeValue}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap gap-4">
        <Link href="/apply/jury" className="ibpa-button ibpa-button-gold">
          {t.common.applyAsJudge}
        </Link>

        <a href="#requirements" className="ibpa-button ibpa-button-white">
          {t.juryPage.hero.requirements}
        </a>
      </div>
    </PageHero>
  );
}
