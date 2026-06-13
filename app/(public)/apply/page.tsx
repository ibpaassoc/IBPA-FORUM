import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationFormLoader from "@/features/applications/components/application-form/ApplicationFormLoader";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import ApplyHero from "@/features/applications/components/pages/ApplyHero";
import { PageSection } from "@/shared/components/public";

export const metadata: Metadata = {
  title: "Apply | IBPA Beauty Award",
  description:
    "Submit your official participant application for the IBPA Beauty Award.",
};

const heroStats = [
  { label: "Categories", value: "11" },
  { label: "Open to", value: "Global" },
  { label: "Season", value: "2026" },
];

export default function ApplyPage() {
  return (
    <main className="page-shell">
      <ApplyHero heroStats={heroStats} />

      <PageSection id="apply-form" className="py-16">
        <Suspense fallback={<ApplicationFormSkeleton />}>
          <ApplicationFormLoader />
        </Suspense>
      </PageSection>
    </main>
  );
}
