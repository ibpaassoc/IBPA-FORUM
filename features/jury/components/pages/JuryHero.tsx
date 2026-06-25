"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HeroPrimaryButton, HeroSecondaryButton } from "@/shared/components/public";

export default function JuryHero() {
  const { t } = useLanguage();

  return (
    <section className="landing-hero-section relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Full-screen background image */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/images/events/JuryHero1.jpg"
          alt="IBPA Jury"
          fill
          style={{ objectPosition: "50% 20%" }}
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.20)_50%,rgba(0,0,0,0.65)_100%)]" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-24 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
        <p className="font-[var(--font-accent-family)] text-[clamp(0.9rem,1.4vw,1.15rem)] italic tracking-wide text-white/70">
          {t.juryPage.copy.heroEyebrow}
        </p>

        <h1 className="mt-4 max-w-[12ch] font-[var(--font-title-family)] text-[clamp(3rem,10vw,7.5rem)] font-light leading-[0.90] tracking-[-0.03em] text-white [text-shadow:0_8px_32px_rgba(0,0,0,0.45)]">
          {t.juryPage.copy.heroTitle}
        </h1>

        <p className="mt-6 max-w-lg font-[var(--font-accent-family)] text-[clamp(1rem,1.8vw,1.25rem)] italic leading-[1.65] text-white/80">
          {t.juryPage.copy.heroText}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <HeroPrimaryButton href="/apply/jury">
            {t.common.applyAsJury}
          </HeroPrimaryButton>
          <HeroSecondaryButton href="/jury/register">
            {t.common.juryAccount}
          </HeroSecondaryButton>
        </div>
      </div>
    </section>
  );
}
