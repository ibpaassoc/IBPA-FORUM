import Link from "next/link";
import { BookOpen, Camera, GraduationCap, HeartHandshake, Trophy } from "lucide-react";
import { categoryCatalog } from "@/features/applications/config/category-catalog";
import {
  CTASection,
  FeatureCard,
  IconBadge,
  PageHero,
  PageSection,
  SectionHeading,
} from "@/shared/components/public";

export default function CategoriesPagePremium() {
  const categoryNames = categoryCatalog.slice(0, 11).map((item) => item.name);

  return (
    <main className="page-shell">
      <PageHero
        eyebrow="Categories"
        title="Professional Championship Categories"
        description="Choose the category that best represents your expertise and submit a focused, high-quality entry."
        actions={
          <Link href="/apply" className="ibpa-button ibpa-button-primary">
            Apply in a Category
          </Link>
        }
      />

      <PageSection>
        <SectionHeading
          eyebrow="Disciplines"
          title="11 paths to international recognition"
          description="Each category reflects a distinct professional specialization."
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-2 xl:grid-cols-3">
          {categoryNames.map((name) => (
            <article key={name} className="page-card rounded-(--radius) p-(--space-lg)">
              <h3 className="text-[clamp(1.25rem,2.3vw,1.8rem)] leading-tight">{name}</h3>
              <p className="mt-(--space-xs) text-sm text-(--color-ink-soft)">
                Focused judging criteria and portfolio-based evaluation.
              </p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection surface="tint">
        <SectionHeading
          eyebrow="Association"
          title="Built by a professional association platform"
          description="IBPA combines championship recognition with long-term professional community and education."
          actions={
            <a href="https://ibpassociations.org/about" target="_blank" rel="noreferrer" className="ibpa-button ibpa-button-ghost">
              Visit IBPA Association
            </a>
          }
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-2">
          <FeatureCard icon={<IconBadge icon={HeartHandshake} />} title="Community" description="A connected global beauty network for professionals and studios." />
          <FeatureCard icon={<IconBadge icon={GraduationCap} />} title="Education" description="Learning pathways, standards, and peer-driven growth." />
          <FeatureCard icon={<IconBadge icon={BookOpen} />} title="Credibility" description="Structured evaluation and trusted professional recognition." />
          <FeatureCard icon={<IconBadge icon={Trophy} />} title="Prestige" description="A polished championship format with editorial presentation." />
        </div>
      </PageSection>

      <CTASection
        eyebrow="Start"
        title="Ready to choose your category?"
        description="Submit your best work with a clear category strategy and premium portfolio presentation."
        primary={{ href: "/apply", label: "Open Application" }}
        secondary={{ href: "/grand-prix", label: "Explore Grand Prix" }}
        extra={
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <IconBadge icon={Camera} size={20} />
            Strong imagery matters for every discipline.
          </div>
        }
      />
    </main>
  );
}
