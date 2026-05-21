"use client";

import { PageMotionShell } from "@/shared/components/public";
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
      <PageMotionShell layoutId="categories-page-layout">
        <CategoriesFeatures />
        <CategoriesAbout />
      </PageMotionShell>
      <CategoriesCTA />
    </main>
  );
}
