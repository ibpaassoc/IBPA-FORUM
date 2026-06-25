"use client";

import {
  HomeHero,
  HomeAwardsInfo,
  HomeThreeExperiences,
  HomeProgram,
  HomeConversionBlock,
  HomeSpeakers,
  HomePreviousForum,
  HomePreviousWinners,
  HomePartners,
  HomeContactUs,
  HomeWhyAttend,
} from "@/features/home/components";

export default function HomePagePremium() {
  return (
    <main className="page-shell">
      <HomeHero />
      <HomeAwardsInfo />
      <HomeThreeExperiences />
      <HomeProgram />
      <HomeConversionBlock />
      <HomeSpeakers />
      <HomePreviousForum />
      <HomePreviousWinners />
      <HomePartners />
      <HomeWhyAttend />
      <HomeContactUs />
    </main>
  );
}
