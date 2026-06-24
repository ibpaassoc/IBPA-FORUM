"use client";

import {
  HomeHero,
  HomeAwardsInfo,
  HomeConversionBlock,
  HomeGrandPrix,
  HomeWhyAttend,
  HomeCategoriesRow,
  HomeSlidingGallery,
  HomeCta,
} from "@/features/home/components";

export default function HomePagePremium() {
  return (
    <main className="page-shell">
      <HomeHero />
      <HomeAwardsInfo />
      <HomeConversionBlock />
      <HomeGrandPrix />
      <HomeWhyAttend />
      <HomeCategoriesRow />
      <HomeSlidingGallery />
      <HomeCta />
    </main>
  );
}
