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
        <div className="relative mx-auto w-full max-w-[920px]">
          <EditorialPhotoCard
            src="/images/editorial/accending.jpg"
            alt="Grand Prix cinematic hero image"
            aspect="landscape"
            overlay="soft"
            objectPosition="center 30%"
            mobileObjectPosition="center 24%"
            priority
            className="relative z-10 overflow-hidden rounded-[var(--radius-lg)] shadow-[0_28px_80px_rgba(37,42,45,0.12)]"
          />

          <div className="relative z-20 mx-auto -mt-[2rem] w-[88%] sm:-mt-[3rem] sm:w-[78%] xl:absolute xl:-bottom-14 xl:left-[18%] xl:mt-0 xl:w-[72%]">
            <EditorialPhotoCard
              src="/images/editorial/items.jpg"
              alt="Grand Prix nominee backstage moment"
              aspect="landscape"
              overlay="soft"
              objectPosition="center 30%"
              mobileObjectPosition="center 22%"
              className="overflow-hidden rounded-[var(--radius)] shadow-[0_24px_60px_rgba(37,42,45,0.16)] ring-8 ring-[var(--surface-tint)]"
            />
          </div>
        </div>
      }
      floatingCard={
      <article className="page-card rounded-[var(--radius)] p-[var(--space-md)] lg:p-[var(--space-sm)]">
        <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">
          {t.grandPrixPage.copy.rule}
        </p>

        <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.25rem,1.5vw,1.65rem)] leading-[1.1] text-[var(--color-ink)]">
          {t.grandPrixPage.copy.fiveCategories}
        </p>

        <p className="mt-2 text-[0.82rem] leading-[1.55] text-[var(--color-ink-soft)]">
          {t.grandPrixPage.copy.qualificationRule}
        </p>
      </article>
    }
    />
  );
}
