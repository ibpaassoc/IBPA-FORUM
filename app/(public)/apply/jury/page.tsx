import JuryApplicationForm from "@/features/jury/components/jury-application/JuryApplicationForm";
import JuryApplyHero from "@/features/jury/components/pages/JuryApplyHero";
import JuryFaq from "@/features/jury/components/pages/JuryFaq";
import JuryProcess from "@/features/jury/components/pages/JuryProcess";
import JuryRequirements from "@/features/jury/components/pages/JuryRequirements";
import { PageShell } from "@/shared/components/layout/PageShell";

export default function JuryApplyPage() {
  return (
    <PageShell>
      <JuryApplyHero />
      <JuryRequirements />
      <JuryProcess />
      <JuryApplicationForm />
      <JuryFaq />
    </PageShell>
  );
}
