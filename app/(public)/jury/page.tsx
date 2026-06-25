import { getPublicJuryMembers } from "@/features/jury/server/queries";

import {
  JuryHero,
  JuryAbout,
  JuryTimeline,
  JurySteps,
  JuryRequirements,
  JuryResponsibilities,
  JuryBenefits,
  JuryCredibility,
  JuryActiveMembers,
  JuryCta,
  JuryFaq,
} from "@/features/jury/components/pages";

export default async function JuryPage() {
  const juryMembers = await getPublicJuryMembers();
  return (
    <main className="page-shell">
      <JuryHero />
      <JuryAbout />
      <JuryTimeline />
      <JuryRequirements />
      <JurySteps />
      <JuryResponsibilities />
      <JuryBenefits />
      <JuryCredibility />
      <JuryActiveMembers juryMembers={juryMembers} />
      <JuryCta />
      <JuryFaq />
    </main>
  );
}
