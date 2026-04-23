import { PageCard, PageHero, PageSection, PageShell } from "@/shared/components/layout/PageShell";

export default function TestJuryPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Jury Test"
        title="Jury Test Route"
        description="A simple internal route for testing jury-facing page layout behavior."
      />
      <PageSection>
        <PageCard className="rounded-3xl p-8">
          <p className="text-lg text-white">The jury test route is working.</p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
