"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function CategoriesGrid() {
  const { t } = useLanguage();
  const categories = t.home.categoriesPreview.items;

  return (
    <PageSection>
      <div className="grid gap-[var(--space-sm)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category, index) => (
          <PageCard
            key={category}
            className="group bg-[var(--color-off-white)] transition hover:border-[var(--color-hover)] hover:bg-[var(--color-navy)]"
          >
            <p className="text-sm font-medium tracking-[0.12em] text-[var(--color-hover)] group-hover:text-[var(--color-title-accent)]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-navy)] group-hover:text-white">
              {category}
            </p>
            <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)] group-hover:text-[rgba(255,255,255,0.55)]">
              {t.categoriesPage.cardText}
            </p>
          </PageCard>
        ))}
      </div>
    </PageSection>
  );
}
