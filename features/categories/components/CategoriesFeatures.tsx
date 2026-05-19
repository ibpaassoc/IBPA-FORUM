"use client";

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
  IconBadge,
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

export default function CategoriesHero() {
  const { t } = useLanguage();

  return (
    <BentoFeatureGrid
      eyebrow={t.categoriesPage.hero.entryRules}
      title={t.categoriesPage.hero.title}
      items={categoryCatalog.map((category, index) => {
        const Icon = categoryIconBySlug[category.slug] ?? Award;
        const span = index % 5 === 0 ? "wide" : "normal";
        return {
          id: category.slug,
          icon: <IconBadge icon={Icon} />,
          title: category.name,
          text: `${category.awards.length} ${
              category.awards.length === 1
              ? t.categoriesPage.copy.nominationSingular
              : t.categoriesPage.copy.nominationPlural
          }`,
          tone: index % 3 === 0 ? "tint" : "default",
          span,
        };
      })}
    />
  );
}
