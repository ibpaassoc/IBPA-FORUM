"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SectionHeading } from "@/shared/components/public";
import PublicJuryGrid from "./PublicJuryGrid";

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

export default function JuryActiveMembers({ juryMembers }: { juryMembers: JuryMember[] }) {
  const { t } = useLanguage();

  if (juryMembers.length === 0) return null;

  return (
    <section id="JuryCouncil" className="landing-section section-rhythm-loose px-[var(--page-gutter)]">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t.juryPage.copy.approvedEyebrow}
          title={t.juryPage.copy.approvedTitle}
        />
        <div className="mt-10">
          <PublicJuryGrid members={juryMembers} />
        </div>
      </div>
    </section>
  );
}
