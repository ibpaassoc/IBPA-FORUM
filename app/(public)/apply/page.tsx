import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationFormLoader from "@/features/applications/components/application-form/ApplicationFormLoader";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import ApplyHero from "@/features/applications/components/pages/ApplyHero";
import ApplyIntroCards from "@/features/applications/components/pages/ApplyIntroCards";
import { applicationTimeline } from "@/features/applications/config/application-timeline";
import { PageSection, PageShell } from "@/shared/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Apply | IBPA Beauty Championship",
  description:
    "Submit your official participant application for the IBPA Beauty Championship.",
};

const heroStats = [
  {
    label: "Entry Fee",
    value: applicationTimeline.feeLabel,
  },
  {
    label: "Deadline",
    value: applicationTimeline.deadlineLabel,
  },
  {
    label: "Judging",
    value: applicationTimeline.judgingLabel,
  },
  {
    label: "Ceremony",
    value: applicationTimeline.ceremonyLabel,
  },
];

export default function ApplyPage() {
  return (
    <PageShell>
      <ApplyHero heroStats={heroStats} />

      <PageSection className="space-y-8">
        <ApplyIntroCards />

        <Suspense fallback={<ApplicationFormSkeleton />}>
          <ApplicationFormLoader />
        </Suspense>
      </PageSection>
    </PageShell>
  );
}
