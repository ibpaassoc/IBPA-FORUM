"use client";

import {
  HomeHero,
  HomeAwardsInfo,
  HomeThreeExperiences,
  HomeConversionBlock,
  HomePreviousForum,
  HomePreviousWinners,
  HomeContactUs,
  HomeWhyAttend,
} from "@/features/home/components";

export default function HomePagePremium() {
  return (
    <main className="page-shell">
      <HomeHero />
      <HomeAwardsInfo />
      <HomeThreeExperiences />
      <HomeConversionBlock />
      <HomePreviousForum />
      <HomePreviousWinners />
      <HomeWhyAttend />
      <HomeContactUs />
    </main>
  );
}
