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
              <div className="gap-[var(--space-md)]">
                <EditorialPhotoCard
                  src="/images/editorial/HomeHero.jpg"
                  alt="IBPA lead editorial beauty image"
                  overlay="medium"
                  aspect="portrait"
                  objectPosition="center 50%"
                  mobileObjectPosition="center 50%"
                  priority
                />
              </div>
            }
          />
  );
}
