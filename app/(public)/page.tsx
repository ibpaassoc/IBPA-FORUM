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
import { LandingPageShell } from "@/shared/components/public";

export default function HomePagePremium() {
  return (
    <LandingPageShell>
      <HomeHero />
      <HomeAwardsInfo />
      <HomeThreeExperiences />
      {/*<HomeProgram />*/}
      <HomeConversionBlock />
      {/*<HomeSpeakers />*/}
      <HomePreviousForum />
      <HomePreviousWinners />
      {/*<HomePartners />*/}
      <HomeWhyAttend />
      <HomeContactUs />
    </LandingPageShell>
  );
}
