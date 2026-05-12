import Link from "next/link";
import {
  Award,
  Calendar,
  Medal,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import {
  EditorialHero,
  EditorialPhotoCard,
  FullBleedPhotoBreak,
  IconBadge,
  PremiumCTA,
  ProcessTimeline,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";

export default function GrandPrixPagePremium() {
  return (
    <main className="page-shell">
      <EditorialHero
        eyebrow="IBPA Grand Prix"
        title="IBPA Grand Prix 2026"
        description="The highest championship distinction for multi-direction performance across the IBPA event platform."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/apply" className="ibpa-button ibpa-button-primary">
              Apply to Compete
            </Link>
            <Link href="/directions" className="ibpa-button ibpa-button-ghost">
              Review Categories
            </Link>
          </div>
        }
        media={
          <div className="grid gap-[var(--space-md)]">
            <EditorialPhotoCard
              src="/images/curated/grandprix_editorial.jpg"
              alt="Grand Prix cinematic hero image"
              aspect="landscape"
              overlay="soft"
              title="Compete Across Disciplines"
              description="Nomination begins when your championship footprint expands."
              priority
            />
            <div className="grid gap-[var(--space-md)] md:grid-cols-2">
              <EditorialPhotoCard
                src="/images/events/DSC00551.jpg"
                alt="Grand Prix nominee backstage moment"
                aspect="square"
                overlay="soft"
              />
              <EditorialPhotoCard
                src="/images/events/DSC09818.jpg"
                alt="Grand Prix finalist portrait"
                aspect="square"
                overlay="soft"
              />
            </div>
          </div>
        }
        floatingCard={
          <article className="page-card rounded-[var(--radius)] p-[var(--space-md)]">
            <p className="text-[0.66rem] uppercase tracking-[0.2em] text-[var(--color-hover)]">Grand Prix Rule</p>
            <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.55rem,2vw,2.1rem)] leading-[1.1] text-[var(--color-ink)]">
              5+ Disciplines
            </p>
            <p className="mt-2 text-sm leading-[1.7] text-[var(--color-ink-soft)]">
              Qualification is based on discipline participation, not category count.
            </p>
          </article>
        }
      />

      <ProcessTimeline
        eyebrow="Selection Flow"
        title="Nomination, judging, and final award decision"
        description="A connected sequence from eligibility to final ranking."
        steps={[
          {
            id: "1",
            title: "Nomination",
            text: "Participants become nominees by competing in 5 or more directions.",
            icon: <IconBadge icon={Medal} />,
          },
          {
            id: "2",
            title: "Judging",
            text: "Each direction is reviewed independently through the official panel process.",
            icon: <IconBadge icon={Users} />,
          },
          {
            id: "3",
            title: "Award Decision",
            text: "Combined results determine the highest-scoring Grand Prix winner.",
            icon: <IconBadge icon={Trophy} />,
          },
        ]}
      />

      <section className="section-rhythm-tight">
        <div className="page-section">
          <SectionHeading
            eyebrow="Timeline Highlights"
            title="Designed for clarity at each championship stage"
            description="Visual emphasis across nomination, review, and nominations presentation."
          />
          <StaggerContainer className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "Application window",
                text: "Participants submit direction entries within official campaign dates.",
              },
              {
                icon: Star,
                title: "Panel scoring period",
                text: "Judges evaluate entries and finalize direction-level scores.",
              },
              {
                icon: Sparkles,
                title: "Grand reveal",
                text: "Finalists and the Grand Prix winner are announced at the ceremony.",
              },
            ].map((item) => (
              <article key={item.title} className="page-card rounded-[var(--radius)] p-[var(--space-lg)]">
                <IconBadge icon={item.icon} />
                <h3 className="mt-[var(--space-sm)] text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.2] text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="mt-[var(--space-xs)] text-sm leading-[1.75] text-[var(--color-ink-soft)]">{item.text}</p>
              </article>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <FullBleedPhotoBreak
        src="/images/events/DSC09821.jpg"
        alt="Grand Prix full-width event moment"
        eyebrow="Grand Prix Atmosphere"
        title="A final stage built for standout multi-direction performance."
        description="A premium nominations environment where cumulative excellence is visibly recognized."
      />

      <PremiumCTA
        eyebrow="Grand Prix Entry"
        title="Build your path to the highest distinction."
        description="Enter multiple directions, elevate your profile, and compete for IBPA's top honor."
        primary={{ href: "/apply", label: "Start Entry" }}
        secondary={{ href: "/directions", label: "View Disciplines" }}
        aside={
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <IconBadge icon={Award} size={20} />
            Multi-discipline strategy matters.
          </div>
        }
      />
    </main>
  );
}
