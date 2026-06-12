"use client";

type JuryMember = {
  id: string;
  fullName: string;
  professionalTitle?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  expertise?: string[] | null;
  profilePhotoFileId?: string | null;
};

import {
  JuryHero,
  JuryTimeline,
  JuryBenefits,
  JuryCredibility,
  JuryActiveMembers,
  JuryCta,
} from "@/features/jury/components/pages";



export default function JuryPage({ juryMembers }: { juryMembers: JuryMember[] }) {
  return (
    <main className="page-shell">
      <JuryHero />
      <JuryTimeline />
      <JuryBenefits />
      <JuryCredibility />
      <JuryActiveMembers juryMembers={juryMembers} />
      <JuryCta />
    </main>
  );
}
