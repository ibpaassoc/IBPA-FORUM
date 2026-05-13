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
  const { language, t } = useLanguage();
  const copy = {
    en: {
      nominationSingular: "nomination",
      nominationPlural: "nominations",
      heroMediaTitle: "Direction depth meets real event energy",
      association: "Association",
      associationTitle:
        "Every direction is tied to real-world artistry and professional standards.",
      associationText:
        "The IBPA award structure is designed to highlight direction-specific excellence while preserving a cohesive global event identity.",
      associationQuote:
        "A direction is not only a label. It is the context for fair judging and meaningful recognition.",
      associationButton: "Visit IBPA Association",
      ctaEyebrow: "Direction Entry",
      ctaTitle: "Choose your strongest direction and submit with confidence.",
      ctaText:
        "From artistry to education and brand leadership, every direction is built for high-quality professional presentation.",
    },
    ru: {
      nominationSingular: "номинация",
      nominationPlural: "номинации",
      heroMediaTitle: "Глубина направления и живая энергия события",
      association: "Ассоциация",
      associationTitle:
        "Каждое направление связано с реальным мастерством и профессиональными стандартами.",
      associationText:
        "Структура премии IBPA подчеркивает высокий стандарт в каждом направлении и сохраняет целостность глобального события.",
      associationQuote:
        "Направление - это не только ярлык. Это контекст для справедливого судейства и значимого признания.",
      associationButton: "Перейти в ассоциацию IBPA",
      ctaEyebrow: "Подача по направлению",
      ctaTitle: "Выберите сильнейшее направление и подайте заявку уверенно.",
      ctaText:
        "От артистизма до образования и бренд-лидерства: каждое направление создано для профессиональной подачи.",
    },
    ua: {
      nominationSingular: "номінація",
      nominationPlural: "номінації",
      heroMediaTitle: "Глибина напрямку та жива енергія події",
      association: "Асоціація",
      associationTitle:
        "Кожен напрямок пов'язаний з реальним професійним мистецтвом і стандартами.",
      associationText:
        "Структура премії IBPA підкреслює високий стандарт у кожному напрямку та зберігає цілісність глобальної події.",
      associationQuote:
        "Напрямок - це не лише ярлик. Це контекст для справедливого суддівства та змістовного визнання.",
      associationButton: "Перейти до асоціації IBPA",
      ctaEyebrow: "Подача за напрямком",
      ctaTitle: "Оберіть найсильніший напрямок і подайте заявку впевнено.",
      ctaText:
        "Від артистизму до освіти та бренд-лідерства: кожен напрямок створений для професійної подачі.",
    },
  }[language];

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
              alt="Editorial beauty direction hero image"
              aspect="landscape"
              overlay="soft"
              title={copy.heroMediaTitle}
              priority
            />
            <div className="grid gap-[var(--space-md)] md:grid-cols-2">
              <EditorialPhotoCard
                src="/images/events/DSC01248.jpg"
                alt="Direction competition closeup"
                aspect="square"
                overlay="soft"
              />
              <EditorialPhotoCard
                src="/images/events/DSC00173.jpg"
                alt="Beauty direction winner portrait"
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
            text: `${category.awards.length} ${
              category.awards.length === 1
                ? copy.nominationSingular
                : copy.nominationPlural
            }`,
            tone: index % 3 === 0 ? "tint" : "default",
            span,
          };
        })}
      />

      <FeaturedStorySection
        eyebrow={copy.association}
        title={copy.associationTitle}
        description={copy.associationText}
        quote={copy.associationQuote}
        media={
          <EditorialPhotoCard
            src="/images/events/DSC09821.jpg"
            alt="Editorial direction story from the event floor"
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
            {copy.associationButton}
          </a>
        }
      />

      <PremiumCTA
        eyebrow={copy.ctaEyebrow}
        title={copy.ctaTitle}
        description={copy.ctaText}
        primary={{ href: "/apply", label: t.common.applyNow }}
        secondary={{ href: "/grand-prix", label: t.common.grandPrix }}
      />
    </main>
  );
}
