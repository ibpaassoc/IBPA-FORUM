"use client";

import {
  EditorialHero,
  EditorialPhotoCard,
} from "@/shared/components/public";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();

  return (
    <EditorialHero
            title={t.home.hero.title}
            description={t.home.hero.description}
            media={
              <div className="grid gap-[var(--space-md)] lg:grid-cols-[1.2fr_0.8fr]">
                <EditorialPhotoCard
                  src="/images/editorial/makeup.jpg"
                  alt="IBPA lead editorial beauty image"
                  title={t.home.copy.heroMediaTitle}
                  overlay="medium"
                  aspect="portrait"
                  objectPosition="center 16%"
                  mobileObjectPosition="center 12%"
                  priority
                />
                <div className="grid gap-[var(--space-md)]">
                  <EditorialPhotoCard
                    src="/images/curated/home_hero_support.jpg"
                    alt="Beauty artist preparing a model backstage"
                    overlay="soft"
                    aspect="square"
                    objectPosition="center 28%"
                    mobileObjectPosition="center 22%"
                    priority
                  />
                  <EditorialPhotoCard
                    src="/images/events/DSC01460.jpg"
                    alt="IBPA event detail closeup"
                    overlay="soft"
                    aspect="square"
                    objectPosition="center 30%"
                    mobileObjectPosition="center 24%"
                  />
                </div>
              </div>
            }
          />
  );
}
