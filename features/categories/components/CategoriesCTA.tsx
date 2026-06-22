"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PremiumCTA } from "@/shared/components/public";


export default function CategoriesHero() {
  const { t } = useLanguage();

  return (
    <PremiumCTA
      eyebrow={t.categoriesPage.copy.ctaEyebrow}
      title={t.categoriesPage.copy.ctaTitle}
      description={t.categoriesPage.copy.ctaText}
      primary={{ href: "/apply", label: t.common.applyAsParticipant }}
      secondary={{ href: "/grand-prix", label: t.common.grandPrix }}
      backgroundImage="/images/gallery/0K9A4883.jpg"
    />
  );
}
