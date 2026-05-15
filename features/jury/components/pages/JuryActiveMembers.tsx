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

  return (
    juryMembers.length > 0 ? (
      <section id="JuryCouncil" className="section-rhythm-tight">
        <div className="page-section">
          <SectionHeading
            eyebrow={t.juryPage.copy.approvedEyebrow}
            title={t.juryPage.copy.approvedTitle}
          />
          <div className="mt-[var(--space-lg)]">
            <PublicJuryGrid members={juryMembers} />
          </div>
        </div>
      </section>
    ) : null
  );
}
