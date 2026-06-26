import {
  GrandPrixHero,
  GrandPrixAbout,
  GrandPrixWhoQualifies,
  GrandPrixWhySpecial,
  GrandPrixDecision,
  GrandPrixRewards,
  GrandPrixTimeline,
  GrandPrixCTA,
  GrandPrixFaq,
} from "@/features/grand-prix/components/";
import { LandingPageShell } from "@/shared/components/public";

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
