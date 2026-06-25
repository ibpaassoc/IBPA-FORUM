"use client";

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

export default function GrandPrixPagePremium() {
  return (
    <main className="page-shell">
      <GrandPrixHero />
      <GrandPrixAbout />
      <GrandPrixWhoQualifies />
      <GrandPrixWhySpecial />
      <GrandPrixDecision />
      <GrandPrixRewards />
      <GrandPrixTimeline />
      <GrandPrixCTA />
      <GrandPrixFaq />
    </main>
  );
}
