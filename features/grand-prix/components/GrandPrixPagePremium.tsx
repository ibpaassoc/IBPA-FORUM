import Link from "next/link";
import { Award, Calendar, Medal, Sparkles, Star } from "lucide-react";
import {
  CTASection,
  EditorialPhotoCard,
  FeatureCard,
  IconBadge,
  PageHero,
  PageSection,
  SectionHeading,
} from "@/shared/components/public";

export default function GrandPrixPagePremium() {
  return (
    <main className="page-shell">
      <PageHero
        eyebrow="Grand Prix"
        title="IBPA Grand Prix 2026"
        description="The highest championship distinction for participants with exceptional performance across multiple disciplines."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/apply" className="ibpa-button ibpa-button-primary">
              Apply to Compete
            </Link>
            <Link href="/categories" className="ibpa-button ibpa-button-ghost">
              Review Categories
            </Link>
          </div>
        }
        media={
          <EditorialPhotoCard
            src="/images/events/DSC00192.jpg"
            alt="Grand Prix event atmosphere"
            aspect="portrait"
            overlay="medium"
            title="Compete Across Disciplines"
            description="Nomination begins when your championship footprint expands."
            priority
          />
        }
      />

      <PageSection>
        <SectionHeading
          eyebrow="How It Works"
          title="Nomination, judging, and final decision"
          description="Grand Prix candidates are identified and ranked through cumulative discipline performance."
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-3">
          <FeatureCard icon={<IconBadge icon={Medal} />} title="Nomination rule" description="Participants entering 5+ disciplines are automatically considered." />
          <FeatureCard icon={<IconBadge icon={Award} />} title="Evaluation model" description="Each discipline is judged independently and scored." />
          <FeatureCard icon={<IconBadge icon={Star} />} title="Final outcome" description="The highest total championship score determines the Grand Prix winner." />
        </div>
      </PageSection>

      <PageSection surface="mist">
        <SectionHeading
          eyebrow="Key Dates"
          title="Championship timeline highlights"
          description="All stages are announced in the IBPA communications timeline."
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-2">
          <FeatureCard icon={<IconBadge icon={Calendar} />} title="Application period" description="Submit your entries before the official category deadline." />
          <FeatureCard icon={<IconBadge icon={Sparkles} />} title="Awards reveal" description="Finalists and Grand Prix winner are announced at the championship presentation." />
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading
          eyebrow="Editorial Atmosphere"
          title="A premium stage for multi-discipline excellence"
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-3">
          <EditorialPhotoCard src="/images/events/DSC00313.jpg" alt="IBPA grand prix visual 1" aspect="portrait" overlay="soft" />
          <EditorialPhotoCard src="/images/events/DSC00934.jpg" alt="IBPA grand prix visual 2" aspect="portrait" overlay="soft" />
          <EditorialPhotoCard src="/images/events/DSC09821.jpg" alt="IBPA grand prix visual 3" aspect="portrait" overlay="soft" />
        </div>
      </PageSection>

      <CTASection
        eyebrow="Grand Prix Entry"
        title="Build your path to the top distinction"
        description="Enter multiple disciplines and compete for IBPA's highest recognition."
        primary={{ href: "/apply", label: "Start Entry" }}
        secondary={{ href: "/categories", label: "View Disciplines" }}
      />
    </main>
  );
}
