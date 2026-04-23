import { PageCard, PageHero, PageSection, PageShell } from "@/shared/components/layout/PageShell";

export default function TestPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Test Route"
        title="Beauty Web Test Route"
        description="A simple internal page for smoke testing route rendering and shared page shell styling."
      />
      <PageSection>
        <PageCard className="rounded-3xl p-8">
          <p className="text-lg text-white">The public test route is working.</p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
