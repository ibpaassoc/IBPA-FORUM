"use client";

import { 
  CategoriesHero,
  CategoriesFeatures,
  CategoriesAbout,
  CategoriesCTA,
} from "@/features/categories/components";

export default function CategoriesPagePremium() {
  return (
    <main className="page-shell">
      <CategoriesHero />
      <CategoriesFeatures />
      <CategoriesAbout />
      {/* Section divider */}
      <div className="relative z-20 h-36 bg-white">
        <div className="absolute left-1/2 top-1/2 h-px w-[min(86vw,1100px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#72a0c1]/35 to-transparent" />
      </div>
      <CategoriesCTA />
    </main>
  );
}
