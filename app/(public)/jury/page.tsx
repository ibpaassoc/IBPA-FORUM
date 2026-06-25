import { getPublicJuryMembers } from "@/features/jury/server/queries";

import {
  JuryHero,
  JuryTimeline,
  JuryRequirements,
  JuryProcess,
  JuryResponsibilities,
  JuryBenefits,
  JuryCredibility,
  JuryActiveMembers,
  JuryFeeCard,
  JuryCta,
  JuryFaq,
} from "@/features/jury/components/pages";

export default async function JuryPage() {
  const juryMembers = await getPublicJuryMembers();
  return (
    <main className="page-shell">
      <JuryHero />
      <JuryTimeline />
      <JuryRequirements />
      <JuryProcess />
      <JuryResponsibilities />
      <JuryBenefits />
      <JuryCredibility />
      <JuryActiveMembers juryMembers={juryMembers} />
      <JuryFeeCard />
      <JuryCta />
      <JuryFaq />
    </main>
  );
}
