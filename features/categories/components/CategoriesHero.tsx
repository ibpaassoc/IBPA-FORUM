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
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
            {t.categoriesPage.hero.entryRules}
          </p>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              {t.categoriesPage.hero.feeLabel}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {t.categoriesPage.hero.feeValue}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              {t.categoriesPage.hero.eligibilityLabel}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {t.categoriesPage.hero.eligibilityValue}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap gap-4">
        <Link
          href="/apply"
          className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] hover:opacity-90"
        >
          {t.categoriesPage.hero.cta}
        </Link>
      </div>
    </PageHero>
  );
}
