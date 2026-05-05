import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationFormLoader from "@/features/applications/components/application-form/ApplicationFormLoader";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import ApplyPageIntro from "@/features/applications/components/pages/ApplyPageIntro";
import { PageSection, PageShell } from "@/shared/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Apply | IBPA Beauty Championship",
  description:
    "Submit your official participant application for the IBPA Beauty Championship.",
};

export default function ApplyPage() {
  return (
    <PageShell>
      <PageSection className="pt-28 pb-8">
        <ApplyPageIntro />
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <Suspense fallback={<ApplicationFormSkeleton />}>
          <ApplicationFormLoader />
        </Suspense>
      </PageSection>
    </PageShell>
  );
}
