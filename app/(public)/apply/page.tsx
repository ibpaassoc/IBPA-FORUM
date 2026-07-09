import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationFormLoader from "@/features/applications/components/application-form/ApplicationFormLoader";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import ApplyHero from "@/features/applications/components/pages/ApplyHero";
import { LandingPageShell, PageSection } from "@/shared/components/public";

export const metadata: Metadata = {
  title: "Apply | IBPA Beauty Award",
  description:
    "Submit your official participant application for the IBPA Beauty Award.",
};

// The application form loads categories/nominations live from the DB, so this
// page must render dynamically — otherwise a build-time snapshot would hide
// newly added Award rows in production.
export const dynamic = "force-dynamic";

const heroStats = [
  { label: "Categories", value: "11" },
  { label: "Open to", value: "Global" },
  { label: "Season", value: "2026" },
];

export default function ApplyPage() {
  return (
    <LandingPageShell>
      <ApplyHero heroStats={heroStats} />

      <PageSection id="apply-form" className="landing-section py-16">
        <Suspense fallback={<ApplicationFormSkeleton />}>
          <ApplicationFormLoader />
        </Suspense>
      </PageSection>
    </LandingPageShell>
  );
}
