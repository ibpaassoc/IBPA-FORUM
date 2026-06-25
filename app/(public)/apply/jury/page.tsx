import { Suspense } from "react";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import JuryApplicationFormLoader from "@/features/jury/components/jury-application/JuryApplicationFormLoader";
import JuryApplyHero from "@/features/jury/components/jury-application/JuryApplyHero";
import { LandingPageShell, PageSection } from "@/shared/components/public";

export default function JuryApplyPage() {

  return (
    <LandingPageShell>
      <JuryApplyHero></JuryApplyHero>
      <PageSection id="jury-form" className="landing-section py-8">
        <Suspense fallback={<ApplicationFormSkeleton />}>
          <JuryApplicationFormLoader />
        </Suspense>
      </PageSection>
    </LandingPageShell>
  );
}
