"use client";

import Link from "next/link";
import SectionTitle from "@/shared/components/ui/SectionTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CategoriesPreview() {
  const { t } = useLanguage();
  const categories = t.home.categoriesPreview.items;

  return (
    <section className="bg-(--color-white)">
      <div className="mx-auto max-w-(--content-width) px-(--page-gutter) page-section-pad">
        <div className="flex flex-col gap-(--space-md) md:flex-row md:items-end md:justify-between">
          <SectionTitle
            label={t.home.categoriesPreview.label}
            title={t.home.categoriesPreview.title}
            className="max-w-2xl"
          />

          <Link
            href="/categories"
            className="font-(--font-sans) text-[clamp(0.72rem,1vw,0.85rem)] uppercase tracking-widest text-(--color-ink) transition hover:text-(--color-hover)"
          >
            {t.home.categoriesPreview.viewAll} {"->"}
          </Link>
        </div>

        <div className="mt-(--space-xl) grid gap-(--space-sm) sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category}
              href="/categories"
              className="page-card group bg-(--color-off-white) p-(--space-md) transition hover:border-(--color-hover) hover:bg-(--color-hover)"
            >
              <div className="text-sm font-medium tracking-widest text-(--color-hover) group-hover:text-(--color-title-accent)">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="mt-(--space-xs) font-(--font-display) text-[clamp(1.1rem,2vw,1.6rem)] text-(--color-ink) group-hover:text-white">
                {category}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
