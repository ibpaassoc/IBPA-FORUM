"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HeroPrimaryButton, HeroSecondaryButton } from "@/shared/components/public";
import { PUBLIC_MOTION_EASE, PUBLIC_MOTION_DURATION } from "@/shared/components/public/motion-tokens";

export default function GrandPrixHero() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  function enter(delay: number) {
    if (reducedMotion) return {};
    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: PUBLIC_MOTION_DURATION.slow, ease: PUBLIC_MOTION_EASE, delay },
    };
  }

  return (
    <section className="landing-hero-section relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/images/editorial/accending.jpg"
          alt="IBPA Grand Prix"
          fill
          style={{ objectPosition: "center 30%" }}
          className="object-cover opacity-72"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.16)_45%,rgba(0,0,0,0.65)_100%)]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-24 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
        <motion.p
          {...enter(0.1)}
          className="font-[var(--font-accent-family)] text-[clamp(0.9rem,1.4vw,1.15rem)] italic tracking-wide text-white/70"
        >
          {t.grandPrixPage.hero.eyebrow}
        </motion.p>

        <motion.h1
          {...enter(0.22)}
          className="mt-4 max-w-[12ch] font-[var(--font-title-family)] text-[clamp(3rem,10vw,8rem)] font-light leading-[0.90] tracking-[-0.03em] text-white [text-shadow:0_8px_32px_rgba(0,0,0,0.45)]"
        >
          {t.grandPrixPage.hero.title}
        </motion.h1>

        <motion.p
          {...enter(0.34)}
          className="mt-6 max-w-lg font-[var(--font-accent-family)] text-[clamp(1rem,1.8vw,1.25rem)] italic leading-[1.65] text-white/80"
        >
          {t.grandPrixPage.hero.description}
        </motion.p>

        <motion.div
          {...enter(0.44)}
          className="mt-8 max-w-sm rounded-[var(--radius)] border border-white/18 bg-white/12 px-6 py-4 backdrop-blur-md"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/60">
            {t.grandPrixPage.copy.rule}
          </p>
          <p className="mt-1 font-[var(--font-title-family)] text-[1.1rem] font-light text-white">
            {t.grandPrixPage.copy.fiveCategories}
          </p>
        </motion.div>

        <motion.div
          {...enter(0.54)}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <HeroPrimaryButton href="/apply">
            {t.grandPrixPage.hero.cta ?? "Apply Now"}
          </HeroPrimaryButton>
          <HeroSecondaryButton href="#flow">
            {(t.grandPrixPage.hero as { secondary?: string }).secondary ?? "Learn More"}
          </HeroSecondaryButton>
        </motion.div>
      </div>
    </section>
  );
}
