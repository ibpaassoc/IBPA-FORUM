"use client";

import {
  GrandPrixHero,
  GrandPrixFlow,
  GrandPrixTimeline,
  GrandPrixFullBleed,
  GrandPrixCTA
} from "@/features/grand-prix/components/";

export default function GrandPrixPagePremium() {
  return (
    <main className="page-shell">
      <GrandPrixHero />
      <GrandPrixFlow />
      <GrandPrixTimeline />
      <GrandPrixFullBleed />
      <GrandPrixCTA />
    </main>
  );
}
