import { getPublicJuryMembers } from "@/features/jury/server/queries";

import {
  JuryHero,
  JuryTimeline,
  JuryBenefits,
  JuryCredibility,
  JuryActiveMembers,
  JuryCta,
} from "@/features/jury/components/pages";



export default async function JuryPage() {
  const juryMembers = await getPublicJuryMembers();
  return (
    <main className="page-shell">
      <JuryHero />
      <JuryActiveMembers juryMembers={juryMembers} />
      <JuryTimeline />
      <JuryBenefits />
      <JuryCredibility />
      <JuryCta />
    </main>
  );
}
