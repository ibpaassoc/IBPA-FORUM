import GrandPrixCriteria from "@/features/grand-prix/components/GrandPrixCriteria";
import GrandPrixFaq from "@/features/grand-prix/components/GrandPrixFaq";
import GrandPrixHero from "@/features/grand-prix/components/GrandPrixHero";
import GrandPrixPillars from "@/features/grand-prix/components/GrandPrixPillars";
import GrandPrixSelectionFlow from "@/features/grand-prix/components/GrandPrixSelectionFlow";
import { PageShell } from "@/shared/components/layout/PageShell";

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
