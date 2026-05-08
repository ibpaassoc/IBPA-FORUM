import JuryApproved from "@/features/jury/components/pages/JuryAprroved";
import JuryBenefits from "@/features/jury/components/pages/JuryBenefits";
import JuryCta from "@/features/jury/components/pages/JuryCta";
import JuryFaq from "@/features/jury/components/pages/JuryFaq";
import JuryHero from "@/features/jury/components/pages/JuryHero";
import JuryProcess from "@/features/jury/components/pages/JuryProcess";
import JuryRequirements from "@/features/jury/components/pages/JuryRequirements";
import JuryResponsibilities from "@/features/jury/components/pages/JuryResponsibilities";
import { PageShell } from "@/shared/components/layout/PageShell";

export default async function JuryPage() {
  return (
    <PageShell>
      <JuryHero />
      <JuryApproved />
      <JuryBenefits />
      <JuryResponsibilities />
      <JuryRequirements />
      <JuryProcess />
      <JuryFaq />
      <JuryCta />
    </PageShell>
  );
}
