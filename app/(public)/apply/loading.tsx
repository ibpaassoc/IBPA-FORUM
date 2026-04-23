import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import ApplyHero from "@/features/applications/components/pages/ApplyHero";
import ApplyIntroCards from "@/features/applications/components/pages/ApplyIntroCards";
import { applicationTimeline } from "@/features/applications/config/application-timeline";
import { PageSection, PageShell } from "@/shared/components/layout/PageShell";

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

export default function ApplyLoading() {
  return (
    <PageShell>
      <ApplyHero heroStats={heroStats} />

      <PageSection className="space-y-8">
        <ApplyIntroCards />
        <ApplicationFormSkeleton />
      </PageSection>
    </PageShell>
  );
}
