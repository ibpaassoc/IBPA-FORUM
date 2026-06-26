import dynamic from "next/dynamic";
import {
  GrandPrixHero,
  GrandPrixAbout,
  GrandPrixWhoQualifies,
  GrandPrixWhySpecial,
  GrandPrixDecision,
  GrandPrixRewards,
  GrandPrixTimeline,
  GrandPrixCTA,
} from "@/features/grand-prix/components/";
import { LandingPageShell } from "@/shared/components/public";

const GrandPrixFaq = dynamic(
  () => import("@/features/grand-prix/components/GrandPrixFaq")
);

export default function GrandPrixPagePremium() {
  return (
    <LandingPageShell>
      <GrandPrixHero />
      <GrandPrixAbout />
      <GrandPrixWhoQualifies />
      <GrandPrixWhySpecial />
      <GrandPrixDecision />
      <GrandPrixRewards />
      <GrandPrixTimeline />
      <GrandPrixCTA />
      <GrandPrixFaq />
    </LandingPageShell>
  );
}
