import dynamic from "next/dynamic";
import { getPublicJuryMembers } from "@/features/jury/server/queries";

import {
  JuryHero,
  JuryAbout,
  JuryTimeline,
  JuryRequirements,
  JurySteps,
  JuryResponsibilities,
  JuryBenefits,
  JuryCredibility,
  JuryCta,
} from "@/features/jury/components/pages";
import { LandingPageShell } from "@/shared/components/public";

const JuryGallery = dynamic(
  () => import("@/features/jury/components/pages/JuryGallery")
);
const JuryActiveMembers = dynamic(
  () => import("@/features/jury/components/pages/JuryActiveMembers")
);
const JuryFaq = dynamic(
  () => import("@/features/jury/components/pages/JuryFaq")
);

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
