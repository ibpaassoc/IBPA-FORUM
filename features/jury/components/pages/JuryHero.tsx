"use client";

import Link from "next/link";
import EditorialImageCard from "@/shared/components/media/EditorialImageCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageHero } from "@/shared/components/layout/PageShell";

export default function JuryHero() {
  const { t } = useLanguage();

  return (
    <PageHero
      eyebrow={t.juryPage.hero.eyebrow}
      title={t.juryPage.hero.title}
      description={t.juryPage.hero.description}
      asideShellClassName="overflow-hidden border-0 bg-transparent p-0 shadow-none"
      aside={
        <EditorialImageCard
          src="/images/team/sitting_group.jpg"
          alt="IBPA jury and leadership group portrait"
          eyebrow={t.juryPage.hero.overview}
          title="A trusted jury presented with editorial calm"
          text="The jury page now feels connected to real leadership and professional community."
          aspectClassName="aspect-[4/5]"
          objectPosition="center top"
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="shadow-[0_22px_64px_rgba(12,16,20,0.14)]"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                {t.juryPage.hero.experience}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.1rem)] font-light text-white">
                {t.juryPage.hero.experienceValue}
              </p>
            </div>
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                {t.juryPage.hero.review}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.1rem)] font-light text-white">
                {t.juryPage.hero.reviewValue}
              </p>
            </div>
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                {t.juryPage.hero.fee}
              </p>
              <p className="mt-2 font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.1rem)] font-light text-white">
                {t.juryPage.hero.feeValue}
              </p>
            </div>
          </div>
        </EditorialImageCard>
      }
    >
      <div className="flex flex-wrap gap-4">
        <Link href="/apply/jury" className="ibpa-button ibpa-button-gold">
          {t.common.applyAsJudge}
        </Link>

        <a href="#requirements" className="ibpa-button ibpa-button-white">
          {t.juryPage.hero.requirements}
        </a>
      </div>
    </PageHero>
  );
}
