"use client";

import JuryApplicationForm from "@/features/jury/components/jury-application/JuryApplicationForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialPhotoCard,
  PageSection,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";

export default function JuryApplyPage() {
  const { t } = useLanguage();

  return (
    <main className="page-shell">
      <PageSection className="pt-[clamp(76px,10vh,96px)]" surface="tint">
        <div className="grid gap-[var(--space-lg)] xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <SectionHeading
            eyebrow={t.juryPage.apply.eyebrow}
            title={t.juryPage.apply.title}
            description={t.juryPage.apply.text}
          />
          <StaggerContainer className="grid gap-[var(--space-md)] md:grid-cols-2">
            <EditorialPhotoCard
              src="/images/curated/jury_editorial.jpg"
              alt="Jury application onboarding visual"
              aspect="portrait"
              overlay="soft"
              title="Apply as an expert"
              description="Structured, serious, and transparent from the first step."
              priority
            />
            <EditorialPhotoCard
              src="/images/events/DSC00932.jpg"
              alt="Jury process support image"
              aspect="portrait"
              overlay="soft"
            />
          </StaggerContainer>
        </div>
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <JuryApplicationForm />
      </PageSection>
    </main>
  );
}
