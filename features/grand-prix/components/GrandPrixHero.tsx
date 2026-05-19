"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialHero,
  EditorialPhotoCard,
} from "@/shared/components/public";

export default function GrandPrixPagePremium() {
  const { t } = useLanguage();
  
  return (
    <EditorialHero
      eyebrow={t.grandPrixPage.hero.eyebrow}
      title={t.grandPrixPage.hero.title}
      description={t.grandPrixPage.hero.description}
      media={
        <div className="grid gap-[var(--space-md)]">
          <EditorialPhotoCard
            src="/images/curated/grandprix_editorial.jpg"
            alt="Grand Prix cinematic hero image"
            aspect="landscape"
            overlay="soft"
            title={t.grandPrixPage.copy.mediaTitle}
            description={t.grandPrixPage.copy.mediaDescription}
            objectPosition="center 30%"
            mobileObjectPosition="center 24%"
            priority
          />
          <div className="grid gap-[var(--space-md)] md:grid-cols-2">
            <EditorialPhotoCard
              src="/images/events/DSC00551.jpg"
              alt="Grand Prix nominee backstage moment"
              aspect="square"
              overlay="soft"
              objectPosition="center 30%"
              mobileObjectPosition="center 22%"
            />
            <EditorialPhotoCard
              src="/images/community/DSC09818.jpg"
              alt="Grand Prix finalist portrait"
              aspect="square"
              overlay="soft"
              objectPosition="center 30%"
              mobileObjectPosition="center 24%"
            />
          </div>
        </div>
      }
      floatingCard={
        <article className="page-card rounded-[var(--radius)] p-[var(--space-md)]">
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-[var(--color-hover)]">{t.grandPrixPage.copy.rule}</p>
          <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.55rem,2vw,2.1rem)] leading-[1.1] text-[var(--color-ink)]">
            {t.grandPrixPage.copy.fiveCategories}
          </p>
          <p className="mt-2 text-sm leading-[1.7] text-[var(--color-ink-soft)]">{t.grandPrixPage.copy.qualificationRule}</p>
        </article>
      }
    />
  );
}
