"use client";

import Link from "next/link"
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryHero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,var(--color-navy-deep)_0%,var(--color-navy)_50%,var(--color-navy-mid)_100%)] pt-[clamp(60px,8vh,72px)] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_70%_60%_at_80%_40%,rgba(124,168,200,0.15)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(201,169,110,0.08)_0%,transparent_60%)] after:absolute after:inset-0 after:bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] after:bg-[length:clamp(40px,5vw,60px)_clamp(40px,5vw,60px)] after:opacity-[0.04]">
      <div className="relative z-10 mx-auto grid max-w-[var(--content-width)] gap-[var(--space-xl)] px-[var(--page-gutter)] py-[var(--space-2xl)] lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="page-eyebrow">
            {t.juryPage.hero.eyebrow}
          </p>

          <h1 className="mt-[var(--space-md)] max-w-3xl font-[var(--font-display)] text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-[1.1] text-white">
            {t.juryPage.hero.title}
          </h1>

          <p className="mt-[var(--space-md)] max-w-2xl text-sm leading-[1.75] text-[rgba(255,255,255,0.65)] sm:text-base">
            {t.juryPage.hero.description}
          </p>

          <div className="mt-[var(--space-lg)] flex flex-col gap-[var(--space-sm)] sm:flex-row">
            <Link
              href="/apply/jury"
              className="ibpa-button ibpa-button-gold"
            >
              {t.common.applyAsJudge}
            </Link>

            <a
              href="#requirements"
              className="ibpa-button ibpa-button-white"
            >
              {t.juryPage.hero.requirements}
            </a>
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-[var(--space-lg)] text-white backdrop-blur-[12px]">
          <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
            {t.juryPage.hero.overview}
          </p>

          <div className="mt-[var(--space-md)] grid gap-[var(--space-md)] sm:grid-cols-3 lg:grid-cols-1">
            <div>
              <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
                {t.juryPage.hero.experience}
              </p>
              <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-light">
                {t.juryPage.hero.experienceValue}
              </p>
            </div>

            <div>
              <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
                {t.juryPage.hero.review}
              </p>
              <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-light">
                {t.juryPage.hero.reviewValue}
              </p>
            </div>

            <div>
              <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.45)]">
                {t.juryPage.hero.fee}
              </p>
              <p className="mt-[var(--space-xs)] font-[var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-light">
                {t.juryPage.hero.feeValue}
              </p>
              <p className="mt-[var(--space-xs)] text-xs text-[rgba(255,255,255,0.55)]">
                {t.juryPage.hero.feeNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
