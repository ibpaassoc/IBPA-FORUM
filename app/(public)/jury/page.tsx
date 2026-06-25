import { getPublicJuryMembers } from "@/features/jury/server/queries";

import {
  JuryHero,
  JuryAbout,
  JuryTimeline,
  JuryRequirements,
  JuryGallery,
  JurySteps,
  JuryResponsibilities,
  JuryBenefits,
  JuryCredibility,
  JuryActiveMembers,
  JuryCta,
  JuryFaq,
} from "@/features/jury/components/pages";
import { LandingPageShell } from "@/shared/components/public";

export default async function JuryPage() {
  const juryMembers = await getPublicJuryMembers();
  return (
    <LandingPageShell>
      <JuryHero />
      <JuryAbout />
      <JuryTimeline />
      <JuryRequirements />
      <JuryGallery />
      <JurySteps />
      <JuryResponsibilities />
      <JuryBenefits />
      <JuryCredibility />
      <JuryActiveMembers juryMembers={juryMembers} />
      <JuryCta />
      <JuryFaq />
    </LandingPageShell>
  );
}
