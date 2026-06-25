"use client";

import JuryApplicationForm from "@/features/jury/components/jury-application/JuryApplicationForm";
import JuryApplyHero from "@/features/jury/components/jury-application/JuryApplyHero";
import { LandingPageShell, PageSection } from "@/shared/components/public";

export default function JuryApplyPage() {

  return (
    <LandingPageShell>
      <JuryApplyHero></JuryApplyHero>
      <PageSection id="jury-form" className="py-8">
        <JuryApplicationForm />
      </PageSection>
    </LandingPageShell>
  );
}
