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
            className="group bg-white/80 backdrop-blur-xl transition hover:border-[var(--color-blue)]/45 hover:bg-[var(--color-blue-wash)] hover:shadow-[var(--shadow-md)]"
          >
            <p className="text-sm font-medium tracking-[0.12em] text-[var(--color-blue)]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-ink)]">
              {category}
            </p>
            <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-ink-soft)]">
              {t.categoriesPage.cardText}
            </p>
          </PageCard>
        ))}
      </div>
    </PageSection>
  );
}
