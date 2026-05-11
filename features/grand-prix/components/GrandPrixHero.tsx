"use client";

import Link from "next/link";
import EditorialImageCard from "@/shared/components/media/EditorialImageCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageHero } from "@/shared/components/layout/PageShell";

export default function GrandPrixHero() {
  const { t } = useLanguage();

  return (
    <PageHero
      eyebrow={t.grandPrixPage.hero.eyebrow}
      title={t.grandPrixPage.hero.title}
      description={t.grandPrixPage.hero.description}
      asideShellClassName="overflow-hidden border-0 bg-transparent p-0 shadow-none"
      aside={
        <EditorialImageCard
          src="/images/events/DSC00452.jpg"
          alt="Award trophies and recognition at the IBPA ceremony"
          eyebrow={t.grandPrixPage.hero.snapshot}
          title="A ceremonial frame for the Grand Prix story"
          text="The awards page now carries a stronger premium event feel with real ceremony photography."
          aspectClassName="aspect-[4/5]"
          objectPosition="center 28%"
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="shadow-[0_22px_64px_rgba(12,16,20,0.14)]"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                {t.grandPrixPage.hero.eligibility}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1rem,2vw,1.35rem)] font-light text-white">
                {t.grandPrixPage.hero.eligibilityValue}
              </p>
            </div>
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                {t.grandPrixPage.hero.evaluation}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.1rem)] font-light text-white">
                {t.grandPrixPage.hero.evaluationValue}
              </p>
            </div>
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                {t.grandPrixPage.hero.decision}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1rem,2vw,1.35rem)] font-light text-white">
                {t.grandPrixPage.hero.decisionValue}
              </p>
            </div>
          </div>
        </EditorialImageCard>
      }
    >
      <p className="mb-(--space-lg) max-w-2xl text-sm leading-[1.7] text-(--color-ink-soft)">
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
