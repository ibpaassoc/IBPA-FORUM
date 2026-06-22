"use client";

import {
  HomeHero,
  HomeConversionBlock,
  HomeGrandPrix,
  HomeWhyAttend,
  HomeCategoriesRow,
  HomeJuryStandards,
  HomeSlidingGallery,
  HomeCta,
} from "@/features/home/components";

export default function HomePagePremium() {
  return (
    <main className="page-shell">
      <HomeHero />
      <HomeConversionBlock />
      <HomeGrandPrix />
      <HomeWhyAttend />
      <HomeCategoriesRow />
      <HomeJuryStandards />
      <HomeSlidingGallery />
      <HomeCta />
    </main>
  );
}
