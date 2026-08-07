"use client";

import Link from "next/link";
import SectionTitle from "@/shared/components/ui/SectionTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CategoriesPreview() {
  const { t } = useLanguage();
  const categories = t.home.categoriesPreview.items;

  return (
    <section className="bg-[var(--color-white)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] page-section-pad">
        <div className="flex flex-col gap-[var(--space-md)] md:flex-row md:items-end md:justify-between">
          <SectionTitle
            label={t.home.categoriesPreview.label}
            title={t.home.categoriesPreview.title}
            className="max-w-2xl"
          />

          <Link
            href="/directions"
            className="font-[var(--font-ui-family)] text-[clamp(0.72rem,1vw,0.85rem)] uppercase tracking-widest text-[var(--color-ink)] transition hover:text-[var(--color-hover-accent)]"
          >
            {t.home.categoriesPreview.viewAll} {"->"}
          </Link>
        </div>

        <div className="mt-[var(--space-xl)] grid gap-[var(--space-sm)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category}
              href="/directions"
              className="premium-glass group p-[var(--space-md)] transition hover:border-[var(--color-blue)]/45 hover:bg-[var(--color-blue-wash)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="text-sm font-medium tracking-widest text-[var(--color-blue)]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] text-[var(--color-ink)]">
                {category}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
