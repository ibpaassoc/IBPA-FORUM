import {
  CTASection,
  PageHero,
  PageSection,
} from "@/shared/components/public";

export default function UnderDevelopmentPage() {
  return (
    <main className="page-shell">
      <PageHero
        eyebrow="In Progress"
        title="This section is under development"
        description="We are still refining this part of the IBPA Beauty Award website."
      />
      <PageSection>
        <div className="page-card rounded-(--radius-lg) p-8">
          <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
            Check back soon for updated details and finalized content.
          </p>
        </div>
      </PageSection>
      <CTASection
        title="Explore active award pages"
        description="You can continue with directions, jury, applications, and Grand Prix sections."
        primary={{ href: "/", label: "Back Home" }}
        secondary={{ href: "/directions", label: "View Directions" }}
      />
    </main>
  );
}
