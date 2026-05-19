"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialHero,
  EditorialPhotoCard,
} from "@/shared/components/public";

export default function CategoriesHero() {
  const { t } = useLanguage();

  return (
    <EditorialHero
      eyebrow={t.categoriesPage.hero.eyebrow}
      title={t.categoriesPage.hero.title}
      description={t.categoriesPage.hero.description}
      media={
        <div className="relative mx-auto w-full max-w-[720px] pb-[clamp(2.5rem,7vw,4rem)] md:pb-0">
          <EditorialPhotoCard
            src="/images/events/CategoriesHero2.jpg"
            alt="Direction competition closeup"
            aspect="portrait"
            overlay="soft"
            objectPosition="center 34%"
            mobileObjectPosition="center 30%"
            priority
            className="relative z-10 overflow-hidden rounded-[var(--radius-lg)] shadow-[0_28px_80px_rgba(37,42,45,0.12)]"
          />

          <div className="relative z-20 -mt-[clamp(4rem,14vw,7rem)] ml-auto w-[88%] md:absolute md:-bottom-14 md:-left-16 md:mt-0 md:w-[88%]">
            <EditorialPhotoCard
              src="/images/events/CategoriesHero1.jpg"
              alt="Editorial beauty direction hero image"
              aspect="landscape"
              overlay="soft"
              objectPosition="center 28%"
              mobileObjectPosition="center 24%"
              className="overflow-hidden rounded-[var(--radius)] shadow-[0_24px_60px_rgba(37,42,45,0.16)] ring-8 ring-[var(--surface-tint)]"
            />
          </div>
        </div>
      }
    />
  );
}
