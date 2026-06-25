"use client";

import {
  CategoriesHero,
  CategoriesInfo,
  CategoriesFeatures,
  CategoriesWhyJoin,
  CategoriesAwardResults,
  CategoriesCTA,
  CategoriesFAQ,
} from "@/features/categories/components";

export default function CategoriesPagePremium() {
  return (
    <main className="page-shell">
      <CategoriesHero />
      <CategoriesInfo />
      <CategoriesFeatures />
      <CategoriesWhyJoin />
      <CategoriesAwardResults />
      <CategoriesCTA />
      <CategoriesFAQ />
    </main>
  );
}
