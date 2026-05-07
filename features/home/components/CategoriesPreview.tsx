"use client";

import Link from "next/link";
import SectionTitle from "@/shared/components/ui/SectionTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CategoriesPreview() {
  const { t } = useLanguage();
  const categories = t.home.categoriesPreview.items;

  return (
    <section className="bg-[var(--color-white)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <div className="flex flex-col gap-[var(--space-md)] md:flex-row md:items-end md:justify-between">
          <SectionTitle
            label={t.home.categoriesPreview.label}
            title={t.home.categoriesPreview.title}
            className="max-w-2xl"
          />

          <Link
            href="/categories"
            className="font-[var(--font-body)] text-[clamp(0.72rem,1vw,0.85rem)] font-medium uppercase tracking-[0.1em] text-[var(--color-navy)] transition hover:text-[var(--color-gold)]"
          >
            {t.home.categoriesPreview.viewAll} {"->"}
          </Link>
        </div>

        <div className="mt-[var(--space-xl)] grid gap-[var(--space-sm)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category}
              href="/categories"
              className="page-card group bg-[var(--color-off-white)] p-[var(--space-md)] transition hover:border-[var(--color-navy)] hover:bg-[var(--color-navy)]"
            >
              <div className="text-sm font-medium tracking-[0.12em] text-[var(--color-gold)] group-hover:text-[var(--color-gold-light)]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-navy)] group-hover:text-white">
                {category}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
