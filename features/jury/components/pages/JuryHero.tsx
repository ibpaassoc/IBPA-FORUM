"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialHero,
  EditorialPhotoCard,
} from "@/shared/components/public";


export default function JuryHero() {
  const { t } = useLanguage();

  return (
    <EditorialHero
        eyebrow={t.juryPage.copy.heroEyebrow}
        title={t.juryPage.copy.heroTitle}
        description={t.juryPage.copy.heroText}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/apply/jury" className="ibpa-button ibpa-button-primary">
              {t.common.applyNow}
            </Link>
            <Link href="/jury/register" className="ibpa-button ibpa-button-ghost">
              {t.common.juryAccount}
            </Link>
          </div>
        }
        media={
          <div className="grid gap-[var(--space-md)]">
            <EditorialPhotoCard
              src="/images/curated/jury_editorial.jpg"
              alt="Jury hero leadership portrait"
              aspect="landscape"
              overlay="soft"
              title={t.juryPage.copy.leadershipTitle}
              objectPosition="center 30%"
              mobileObjectPosition="center 24%"
              priority
            />
            <div className="grid gap-[var(--space-md)] md:grid-cols-2">
              <EditorialPhotoCard
                src="/images/events/DSC00452.jpg"
                alt="Jury collaboration close-up"
                aspect="square"
                overlay="soft"
                objectPosition="center 30%"
                mobileObjectPosition="center 24%"
              />
              <EditorialPhotoCard
                src="/images/events/DSC00947.jpg"
                alt="Judge reviewing application materials"
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
            <p className="text-[0.67rem] uppercase tracking-[0.2em] text-[var(--color-hover)]">{t.juryPage.copy.credibility}</p>
            <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.6rem,2.1vw,2.2rem)] leading-[1.1] text-[var(--color-ink)]">
              {t.juryPage.hero.experienceValue}
            </p>
            <p className="mt-2 text-sm leading-[1.7] text-[var(--color-ink-soft)]">{t.juryPage.copy.credibilityText}</p>
          </article>
        }
      />
  );
}
