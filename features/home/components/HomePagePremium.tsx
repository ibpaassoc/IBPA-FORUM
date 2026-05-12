"use client";

import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Calendar,
  Camera,
  ClipboardCheck,
  Globe,
  HeartHandshake,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  BentoFeatureGrid,
  EditorialHero,
  EditorialPhotoCard,
  EditorialPhotoSection,
  FeaturedStorySection,
  FullBleedPhotoBreak,
  IconBadge,
  PremiumCTA,
  ProcessTimeline,
  StaggerContainer,
} from "@/shared/components/public";

const categoryIconMap = [Camera, Trophy, Award, BadgeCheck, Globe, Users, HeartHandshake, Calendar];

export default function HomePagePremium() {
  const { t } = useLanguage();

  const leadershipItems = t.home.process.steps.slice(0, 4).map((step) => ({
    id: step.number,
    icon: <IconBadge icon={categoryIconMap[(Number(step.number) || 1) % categoryIconMap.length]} />,
    title: step.title,
    text: step.text,
    tone: step.number === "01" || step.number === "03" ? ("tint" as const) : ("default" as const),
    span: step.number === "01" ? ("wide" as const) : ("normal" as const),
  }));

  return (
    <main className="page-shell">
      <EditorialHero
        eyebrow={t.home.hero.eyebrow}
        title={t.home.hero.title}
        description={t.home.hero.description}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/apply" className="ibpa-button ibpa-button-primary">
              {t.common.applyNow}
            </Link>
            <Link href="/categories" className="ibpa-button ibpa-button-ghost">
              {t.home.hero.categoriesCta}
            </Link>
          </div>
        }
        media={
          <div className="grid gap-[var(--space-md)] lg:grid-cols-[1.2fr_0.8fr]">
            <EditorialPhotoCard
              src="/images/editorial/makeup.jpg"
              alt="IBPA lead editorial beauty image"
              title="Luxury Editorial Presence"
              description="Professional beauty excellence staged with international credibility."
              overlay="medium"
              aspect="portrait"
              className="h-full"
              priority
            />
            <div className="grid gap-[var(--space-md)]">
              <EditorialPhotoCard
                src="/images/curated/home_hero_support.jpg"
                alt="Beauty artist preparing a model backstage"
                overlay="soft"
                aspect="square"
                priority
              />
              <EditorialPhotoCard
                src="/images/events/DSC01460.jpg"
                alt="IBPA event detail closeup"
                overlay="soft"
                aspect="square"
              />
            </div>
          </div>
        }
        floatingCard={
          <article className="page-card rounded-[var(--radius)] bg-[var(--surface)] p-[var(--space-md)]">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--color-hover)]">
              {t.home.stats[0].title}
            </p>
            <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.6rem,2vw,2.2rem)] leading-[1.1] text-[var(--color-ink)]">
              {t.home.stats[0].value}
            </p>
            <p className="mt-2 text-sm leading-[1.7] text-[var(--color-ink-soft)]">{t.home.stats[0].text}</p>
          </article>
        }
      />

      <section className="section-rhythm-tight">
        <div className="page-section">
          <div className="editorial-soft-divider rounded-[var(--radius)] px-[var(--space-md)] py-[var(--space-md)]">
            <StaggerContainer className="grid gap-[var(--space-md)] md:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
              {t.home.stats.map((item) => (
                <article key={item.title} className="px-[var(--space-sm)]">
                  <p className="text-[0.66rem] uppercase tracking-[0.17em] text-[var(--color-hover)]">{item.title}</p>
                  <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.55rem,2.8vw,2.3rem)] leading-[1.1] text-[var(--color-ink)]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-[1.7] text-[var(--color-ink-soft)]">{item.text}</p>
                </article>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      <BentoFeatureGrid
        eyebrow="Why IBPA"
        title="Designed for professional beauty leadership"
        description="Structured selection, transparent judging, and global brand-level presentation."
        items={leadershipItems}
      />

      <section className="section-rhythm-tight">
        <div className="page-section">
          <div className="flex flex-wrap items-center gap-3">
            {t.home.categoriesPreview.items.slice(0, 8).map((item, index) => {
              const Icon = categoryIconMap[index % categoryIconMap.length];
              return (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-tint)] px-4 py-2 text-sm text-[var(--color-ink-soft)]"
                >
                  <Icon size={18} strokeWidth={1.5} className="text-[var(--color-hover)]" />
                  {item}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <FeaturedStorySection
        eyebrow="Jury Standards"
        title="Official judging with trust, structure, and transparency."
        description={t.home.juryCta.text2}
        quote={t.home.juryCta.text3}
        media={
          <EditorialPhotoCard
            src="/images/curated/jury_editorial.jpg"
            alt="Professional jury leadership and community moment"
            aspect="landscape"
            overlay="soft"
            className="h-full"
          />
        }
        actions={
          <Link href="/jury" className="ibpa-button ibpa-button-ghost">
            {t.home.juryCta.button}
          </Link>
        }
      />

      <ProcessTimeline
        eyebrow={t.home.process.label}
        title={t.home.process.title}
        steps={t.home.process.steps.map((step, index) => ({
          id: step.number,
          title: step.title,
          text: step.text,
          icon: <IconBadge icon={[Search, ClipboardCheck, Award, Trophy, Users][index % 5]} />,
        }))}
      />

      <EditorialPhotoSection
        eyebrow="Event Experience"
        title="Photography integrated into every stage."
        description="One dominant visual frame, supported by two contextual moments."
        primary={{
          src: "/images/events/DSC09822.jpg",
          alt: "IBPA event stage atmosphere",
          title: "A premium ceremony environment",
        }}
        secondary={[
          {
            src: "/images/events/DSC00313.jpg",
            alt: "IBPA backstage artist moment",
          },
          {
            src: "/images/events/DSC00934.jpg",
            alt: "IBPA winner and audience reaction",
          },
        ]}
      />

      <FullBleedPhotoBreak
        src="/images/curated/home_photo_break.jpg"
        alt="Cinematic beauty portrait for IBPA visual break"
        eyebrow="IBPA 2026"
        title="Global beauty artistry deserves a world-class stage."
        description="A calm, premium platform for artists, educators, salons, and brands."
      />

      <PremiumCTA
        eyebrow={t.home.cta.label}
        title={t.home.cta.title}
        description={t.home.cta.text}
        primary={{ href: "/apply", label: t.common.applyNow }}
        secondary={{ href: "/jury", label: t.home.cta.judge }}
        aside={
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <IconBadge icon={Trophy} size={20} />
              International recognition
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <IconBadge icon={BadgeCheck} size={20} />
              Structured judging integrity
            </div>
          </div>
        }
      />
    </main>
  );
}
