"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Brush,
  Camera,
  Gem,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  SprayCan,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { categoryCatalog } from "@/features/applications/config/category-catalog";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  BentoFeatureGrid,
  EditorialHero,
  EditorialPhotoCard,
  FeaturedStorySection,
  IconBadge,
  PremiumCTA,
} from "@/shared/components/public";

const categoryIconBySlug: Record<string, LucideIcon> = {
  hair: SprayCan,
  nail: Gem,
  brow: Brush,
  lash: Sparkles,
  "skin-cosmetology": Star,
  "facial-treatments": HeartHandshake,
  "makeup-artistry": Camera,
  "permanent-makeup": Award,
  "body-wellness": Users,
  education: GraduationCap,
  salon: Trophy,
  brand: BookOpen,
};

export default function CategoriesPagePremium() {
  const { t } = useLanguage();

  return (
    <main className="page-shell">
      <EditorialHero
        eyebrow={t.categoriesPage.hero.eyebrow}
        title={t.categoriesPage.hero.title}
        description={t.categoriesPage.hero.description}
        actions={
          <Link href="/apply" className="ibpa-button ibpa-button-primary">
            {t.categoriesPage.hero.cta}
          </Link>
        }
        media={
          <div className="grid gap-[var(--space-md)]">
            <EditorialPhotoCard
              src="/images/curated/categories_editorial.jpg"
              alt="Editorial beauty category hero image"
              aspect="landscape"
              overlay="soft"
              title="Category depth meets real event energy"
              priority
            />
            <div className="grid gap-[var(--space-md)] md:grid-cols-2">
              <EditorialPhotoCard
                src="/images/events/DSC01248.jpg"
                alt="Category competition closeup"
                aspect="square"
                overlay="soft"
              />
              <EditorialPhotoCard
                src="/images/events/DSC00173.jpg"
                alt="Beauty category winner portrait"
                aspect="square"
                overlay="soft"
              />
            </div>
          </div>
        }
      />

      <BentoFeatureGrid
        eyebrow={t.categoriesPage.hero.entryRules}
        title={t.categoriesPage.hero.title}
        description={t.categoriesPage.cardText}
        items={categoryCatalog.map((category, index) => {
          const Icon = categoryIconBySlug[category.slug] ?? Award;
          const span = index % 5 === 0 ? "wide" : "normal";
          return {
            id: category.slug,
            icon: <IconBadge icon={Icon} />,
            title: category.name,
            text: `${category.awards.length} award tracks`,
            tone: index % 3 === 0 ? "tint" : "default",
            span,
          };
        })}
      />

      <FeaturedStorySection
        eyebrow="Association"
        title="Every category is tied to real-world artistry and professional standards."
        description="The IBPA championship structure is designed to highlight discipline-specific excellence while preserving a cohesive global event identity."
        quote="A category is not only a label. It is the context for fair judging and meaningful recognition."
        media={
          <EditorialPhotoCard
            src="/images/events/DSC09821.jpg"
            alt="Editorial category story from the event floor"
            aspect="landscape"
            overlay="soft"
            className="h-full"
          />
        }
        actions={
          <a
            href="https://ibpassociations.org/about"
            target="_blank"
            rel="noreferrer"
            className="ibpa-button ibpa-button-ghost"
          >
            Visit IBPA Association
          </a>
        }
      />

      <PremiumCTA
        eyebrow="Category Entry"
        title="Choose your strongest category and submit with confidence."
        description="From artistry to education and brand leadership, every category is built for high-quality professional presentation."
        primary={{ href: "/apply", label: t.common.applyNow }}
        secondary={{ href: "/grand-prix", label: t.common.grandPrix }}
      />
    </main>
  );
}
