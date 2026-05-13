"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialHero,
  EditorialPhotoCard,
} from "@/shared/components/public";


export default function DirectionsHero() {
  const { t } = useLanguage();

  return (
    <EditorialHero
        eyebrow={t.categoriesPage.hero.eyebrow}
        title={t.categoriesPage.hero.title}
        description={t.categoriesPage.hero.description}
        media={
          <div className="grid gap-[var(--space-md)]">
            <EditorialPhotoCard
              src="/images/curated/categories_editorial.jpg"
              alt="Editorial beauty direction hero image"
              aspect="landscape"
              overlay="soft"
              title={t.categoriesPage.copy.heroMediaTitle}
              objectPosition="center 28%"
              mobileObjectPosition="center 22%"
              priority
            />
            <div className="grid gap-[var(--space-md)] md:grid-cols-2">
              <EditorialPhotoCard
                src="/images/events/DSC01248.jpg"
                alt="Direction competition closeup"
                aspect="square"
                overlay="soft"
                objectPosition="center 32%"
                mobileObjectPosition="center 24%"
              />
              <EditorialPhotoCard
                src="/images/events/DSC00173.jpg"
                alt="Beauty direction winner portrait"
                aspect="square"
                overlay="soft"
                objectPosition="center 30%"
                mobileObjectPosition="center 24%"
              />
            </div>
          </div>
        }
      />
    );
}
