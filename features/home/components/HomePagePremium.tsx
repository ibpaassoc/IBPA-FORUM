"use client";

import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Calendar,
  Camera,
  Globe,
  HeartHandshake,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import {
  AnimatedReveal,
  CTASection,
  EditorialPhotoCard,
  FeatureCard,
  IconBadge,
  PageHero,
  PageSection,
  SectionHeading,
  StatCard,
} from "@/shared/components/public";

const stats = [
  { label: "Categories", value: "11", description: "Professional tracks in beauty and wellness." },
  { label: "Grand Prix", value: "5+", description: "Disciplines required for automatic nomination." },
  { label: "Jury Review", value: "14 Days", description: "Transparent panel review timeline." },
  { label: "Global Reach", value: "Worldwide", description: "Artists, educators, salons, and brands." },
];

const whyItems = [
  { icon: Trophy, title: "Prestige-led recognition", description: "A championship format built for serious professional achievement." },
  { icon: BadgeCheck, title: "Trusted judging", description: "Independent experts evaluate entries with clear scoring standards." },
  { icon: Users, title: "Professional community", description: "Connect with peers, mentors, and respected beauty leaders." },
  { icon: Globe, title: "International credibility", description: "A global platform for visibility across markets and disciplines." },
];

const categories = ["Hair", "Makeup", "Nails", "Brows", "Lashes", "Education", "Wellness", "Brand"];

export default function HomePagePremium() {
  return (
    <main className="page-shell">
      <PageHero
        eyebrow="IBPA Beauty Championship"
        title="A luxury editorial stage for global beauty excellence."
        description="IBPA brings together artistry, education, and professional credibility through one elegant championship platform."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/apply" className="ibpa-button ibpa-button-primary">
              Apply Now
            </Link>
            <Link href="/categories" className="ibpa-button ibpa-button-ghost">
              Explore Categories
            </Link>
          </div>
        }
        media={
          <EditorialPhotoCard
            src="/images/editorial/makeup.jpg"
            alt="IBPA editorial model portrait"
            title="Editorial Quality. Professional Credibility."
            description="A championship identity built around real imagery and real achievement."
            aspect="portrait"
            overlay="medium"
            priority
          />
        }
      />

      <PageSection>
        <div className="grid gap-(--space-md) sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, idx) => (
            <AnimatedReveal key={item.label} delayMs={idx * 70}>
              <StatCard {...item} />
            </AnimatedReveal>
          ))}
        </div>
      </PageSection>

      <PageSection surface="tint">
        <SectionHeading
          eyebrow="Why IBPA"
          title="Designed for professional beauty leadership"
          description="A premium structure that balances artistry, fairness, and global exposure."
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-2">
          {whyItems.map((item, idx) => (
            <AnimatedReveal key={item.title} delayMs={idx * 80}>
              <FeatureCard
                icon={<IconBadge icon={item.icon} />}
                title={item.title}
                description={item.description}
              />
            </AnimatedReveal>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading
          eyebrow="Championship Tracks"
          title="Category Preview"
          description="Select your strongest discipline and build your entry with intention."
        />
        <div className="mt-(--space-md) flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category} className="rounded-full border border-(--border-soft) bg-(--surface-tint) px-4 py-2 text-sm text-(--color-ink-soft)">
              {category}
            </span>
          ))}
        </div>
      </PageSection>

      <PageSection surface="mist">
        <SectionHeading
          eyebrow="Credibility"
          title="Jury and Professional Standards"
          description="Each submission is evaluated by experienced judges with category-specific expertise."
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) lg:grid-cols-2">
          <FeatureCard
            icon={<IconBadge icon={HeartHandshake} />}
            title="Independent review integrity"
            description="A structured judging flow from submission validation to final scoring."
          />
          <FeatureCard
            icon={<IconBadge icon={Calendar} />}
            title="Clear timeline and outcomes"
            description="Defined review windows and transparent advancement through each stage."
          />
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading
          eyebrow="Event Atmosphere"
          title="A photo-driven championship experience"
          description="Real moments from the IBPA ecosystem, captured with editorial clarity."
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-3">
          <EditorialPhotoCard src="/images/events/DSC09822.jpg" alt="IBPA event atmosphere" aspect="portrait" overlay="soft" />
          <EditorialPhotoCard src="/images/events/DSC01430.jpg" alt="IBPA runway and judging moment" aspect="portrait" overlay="soft" />
          <EditorialPhotoCard src="/images/events/DSC00962.jpg" alt="IBPA award stage detail" aspect="portrait" overlay="soft" />
        </div>
      </PageSection>

      <CTASection
        eyebrow="Next Step"
        title="Ready to enter IBPA 2026?"
        description="Submit your best work, join the international stage, and compete with confidence."
        primary={{ href: "/apply", label: "Start Application" }}
        secondary={{ href: "/jury", label: "Become a Judge" }}
        extra={
          <div className="flex flex-wrap gap-4 text-sm text-(--color-ink-soft)">
            <span className="inline-flex items-center gap-2"><IconBadge icon={Sparkles} size={20} /> Elegant presentation</span>
            <span className="inline-flex items-center gap-2"><IconBadge icon={Camera} size={20} /> Editorial imagery</span>
            <span className="inline-flex items-center gap-2"><IconBadge icon={Award} size={20} /> Professional recognition</span>
          </div>
        }
      />
    </main>
  );
}
