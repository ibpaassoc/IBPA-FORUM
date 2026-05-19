"use client";

import { 
  CategoriesHero,
  CategoriesFeatures,
  CategoriesAbout,
  CategoriesCTA
} from "@/features/categories/components";

export default function CategoriesPage() {
  return (
    <main className="page-shell">
      <CategoriesHero />
      <CategoriesFeatures />
      <CategoriesAbout />
      <CategoriesCTA />
    </main>
  );
}
