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
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
            {t.grandPrixPage.hero.snapshot}
          </p>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              {t.grandPrixPage.hero.eligibility}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {t.grandPrixPage.hero.eligibilityValue}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              {t.grandPrixPage.hero.evaluation}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {t.grandPrixPage.hero.evaluationValue}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              {t.grandPrixPage.hero.decision}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {t.grandPrixPage.hero.decisionValue}
            </p>
          </div>
        </div>
      }
    >
      <p className="page-copy mb-8 max-w-2xl text-sm">
        {t.grandPrixPage.hero.body}
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/categories"
          className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:border-[#d8c27a] hover:text-[#d8c27a]"
        >
          {t.grandPrixPage.hero.cta}
        </Link>
      </div>
    </PageHero>
  );
}
