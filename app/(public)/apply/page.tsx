import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationFormLoader from "@/features/applications/components/application-form/ApplicationFormLoader";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import ApplyPageIntro from "@/features/applications/components/pages/ApplyPageIntro";
import { PageSection } from "@/shared/components/public";

export const metadata: Metadata = {
  title: "Apply | IBPA Beauty Championship",
  description:
    "Submit your official participant application for the IBPA Beauty Championship.",
};

export default function ApplyPage() {
  return (
    <main className="page-shell">
      <PageSection className="pt-[clamp(76px,10vh,96px)]" surface="tint">
        <ApplyPageIntro />
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <Suspense fallback={<ApplicationFormSkeleton />}>
          <ApplicationFormLoader />
        </Suspense>
      </PageSection>
    </main>
  );
}
