"use client";

import Link from "next/link";
import EditorialImageCard from "@/shared/components/media/EditorialImageCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageHero } from "@/shared/components/layout/PageShell";

export default function CategoriesHero() {
  const { t } = useLanguage();

  return (
    <PageHero
      eyebrow={t.categoriesPage.hero.eyebrow}
      title={t.categoriesPage.hero.title}
      description={t.categoriesPage.hero.description}
      asideShellClassName="overflow-hidden border-0 bg-transparent p-0 shadow-none"
      aside={
        <EditorialImageCard
          src="/images/editorial/makeup.jpg"
          alt="Luxury beauty editorial portrait for the directions page"
          eyebrow={t.categoriesPage.hero.entryRules}
          title="Editorial energy for the entry journey"
          text="A premium visual that sets the tone for applying across IBPA directions."
          aspectClassName="aspect-[4/5]"
          objectPosition="center 18%"
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="shadow-[0_22px_64px_rgba(12,16,20,0.14)]"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                {t.categoriesPage.hero.feeLabel}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.2rem)] font-light text-white">
                {t.categoriesPage.hero.feeValue}
              </p>
            </div>
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                {t.categoriesPage.hero.eligibilityLabel}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1rem,2vw,1.35rem)] font-light text-white">
                {t.categoriesPage.hero.eligibilityValue}
              </p>
            </div>
          </div>
        </EditorialImageCard>
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
