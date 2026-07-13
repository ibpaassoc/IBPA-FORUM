import dynamic from "next/dynamic";
import {
  HomeHero,
  HomeAwardsInfo,
  HomeThreeExperiences,
  HomeProgram,
  HomeConversionBlock,
  HomeDressCode,
  HomePreviousForum,
  HomePartners,
} from "@/features/home/components";
import { LandingPageShell } from "@/shared/components/public";

const HomeSpeakers = dynamic(
  () => import("@/features/home/components/HomeSpeakers")
);

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
      <HomeSpeakers />
      <HomeDressCode />
      <HomePreviousForum />
      <HomePreviousWinners />
      {/*<HomePartners />*/}
      {/*<HomeWhyAttend />*/}
      <HomeContactUs />
    </LandingPageShell>
  );
}
