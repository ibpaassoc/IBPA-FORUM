import { PageShell } from "@/components/layout/PageShell";
import GrandPrixHero from "@/components/grand-prix/GrandPrixHero";
import GrandPrixPillars from "@/components/grand-prix/GrandPrixPillars";
import GrandPrixCriteria from "@/components/grand-prix/GrandPrixCriteria";
import GrandPrixSelectionFlow from "@/components/grand-prix/GrandPrixSelectionFlow";
import GrandPrixFaq from "@/components/grand-prix/GrandPrixFaq";

export default function GrandPrixPage() {
  return (
    <PageShell>
      <GrandPrixHero />
      <GrandPrixPillars />
      <GrandPrixCriteria />
      <GrandPrixSelectionFlow />
      <GrandPrixFaq />
    </PageShell>
  );
}
