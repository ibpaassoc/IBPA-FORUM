"use client";

import {
  HomeHero,
  HomeAwardsInfo,
  HomeThreeExperiences,
  HomeConversionBlock,
  HomePreviousForum,
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
      <HomeThreeExperiences />
      <HomeConversionBlock />
      <HomePreviousForum />
      <HomeWhyAttend />
      <HomeCategoriesRow />
      <HomeSlidingGallery />
      <HomeCta />
    </main>
  );
}
