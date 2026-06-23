"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HeroPrimaryButton, HeroSecondaryButton } from "@/shared/components/public";

export default function GrandPrixHero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Full-screen background image */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/images/editorial/accending.jpg"
          alt="IBPA Grand Prix"
          fill
          style={{ objectPosition: "center 30%" }}
          className="object-cover opacity-72"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.16)_45%,rgba(0,0,0,0.65)_100%)]" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-24 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
        <p className="font-[var(--font-accent-family)] text-[clamp(0.9rem,1.4vw,1.15rem)] italic tracking-wide text-white/70">
          {t.grandPrixPage.hero.eyebrow}
        </p>

        <h1 className="mt-4 max-w-[12ch] font-[var(--font-title-family)] text-[clamp(3rem,10vw,8rem)] font-light leading-[0.90] tracking-[-0.03em] text-white [text-shadow:0_8px_32px_rgba(0,0,0,0.45)]">
          {t.grandPrixPage.hero.title}
        </h1>

        <p className="mt-6 max-w-lg font-[var(--font-accent-family)] text-[clamp(1rem,1.8vw,1.25rem)] italic leading-[1.65] text-white/80">
          {t.grandPrixPage.hero.description}
        </p>

        {/* Qualification rule glass chip */}
        <div className="mt-8 max-w-sm rounded-[var(--radius)] border border-white/18 bg-white/12 px-6 py-4 backdrop-blur-md">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/60">
            {t.grandPrixPage.copy.rule}
          </p>
          <p className="mt-1 font-[var(--font-title-family)] text-[1.1rem] font-light text-white">
            {t.grandPrixPage.copy.fiveCategories}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <HeroPrimaryButton href="/apply">
            {t.grandPrixPage.hero.cta ?? "Apply Now"}
          </HeroPrimaryButton>
          <HeroSecondaryButton href="#flow">
            {t.grandPrixPage.hero.secondary ?? "Learn More"}
          </HeroSecondaryButton>
        </div>
      </div>
    </section>
  );
}
