"use client";

import {
  HomeHero,
  HomeAwardsInfo,
  HomeThreeExperiences,
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
      <HomeThreeExperiences />
      <HomeGrandPrix />
      <HomeWhyAttend />
      <HomeCategoriesRow />
      <HomeSlidingGallery />
      <HomeConversionBlock />
      <HomeCta />
    </main>
  );
}
