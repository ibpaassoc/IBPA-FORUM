import dynamic from "next/dynamic";
import {
  HomeHero,
  HomeAwardsInfo,
  HomeThreeExperiences,
  HomeProgram,
  HomeConversionBlock,
  HomeSpeakers,
  HomePreviousForum,
  HomePartners,
} from "@/features/home/components";
import { LandingPageShell } from "@/shared/components/public";

const HomePreviousWinners = dynamic(
  () => import("@/features/home/components/HomePreviousWinners")
);
const HomeWhyAttend = dynamic(
  () => import("@/features/home/components/HomeWhyAttend")
);
const HomeContactUs = dynamic(
  () => import("@/features/home/components/HomeContactUs")
);

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
