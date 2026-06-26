import {
  GrandPrixHero,
  GrandPrixFlow,
  GrandPrixTimeline,
  GrandPrixCTA,
} from "@/features/grand-prix/components/";

export default function GrandPrixPagePremium() {
  return (
    <main className="page-shell">
      <GrandPrixHero />
      <GrandPrixFlow />
      <GrandPrixTimeline />
      <GrandPrixCTA />
    </main>
  );
}
