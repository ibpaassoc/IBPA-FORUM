import {
  PageCard,
  PageHero,
  PageSection,
  PageShell,
} from "@/shared/components/layout/PageShell";

export default function UnderDevelopmentPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="In Progress"
        title="This section is under development"
        description="We are still refining this part of the IBPA Beauty Championship website."
      />
      <PageSection>
        <PageCard className="rounded-[var(--radius)] p-8">
          <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
            Check back soon for updated details and finalized content.
          </p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
