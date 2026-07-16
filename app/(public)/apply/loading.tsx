import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import ApplyHero from "@/features/applications/components/pages/ApplyHero";
import { LandingPageShell, PageSection } from "@/shared/components/public";

export default function ApplyLoading() {
  return (
    <LandingPageShell>
      <ApplyHero />
      <PageSection className="landing-section py-16">
        <ApplicationFormSkeleton />
      </PageSection>
    </LandingPageShell>
  );
}
