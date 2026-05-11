"use client";

import JuryApplicationForm from "@/features/jury/components/jury-application/JuryApplicationForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageSection, SectionHeading } from "@/shared/components/public";

export default function JuryApplyPage() {
  const { t } = useLanguage();

  return (
    <main className="page-shell">
      <PageSection className="pt-[clamp(76px,10vh,96px)]" surface="tint">
        <SectionHeading
          eyebrow={t.juryPage.apply.eyebrow}
          title={t.juryPage.apply.title}
          description={t.juryPage.apply.text}
        />
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <JuryApplicationForm />
      </PageSection>
    </main>
  );
}
