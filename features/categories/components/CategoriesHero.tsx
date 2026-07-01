"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  HeroPrimaryButton,
  HeroSecondaryButton,
} from "@/shared/components/public";
import { PUBLIC_MOTION_EASE, PUBLIC_MOTION_DURATION } from "@/shared/components/public/motion-tokens";

export default function CategoriesHero() {
  const { t } = useLanguage();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const descriptionId = "categories-hero-description";

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
          src="/images/editorial/styling.jpg"
          alt="IBPA Award Categories"
          fill
          style={{ objectPosition: "center 34%" }}
          className="object-cover opacity-70"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.26)_0%,rgba(0,0,0,0.12)_48%,rgba(0,0,0,0.70)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_38%)]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-20 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
        <motion.p
          {...enter(0.1)}
          className="font-[var(--font-accent-family)] text-[clamp(0.9rem,1.4vw,1.15rem)] italic tracking-wide text-white/70"
        >
          {t.categoriesPage.hero.eyebrow}
        </motion.p>

        <motion.h1
          {...enter(0.22)}
          className="mt-4 max-w-[14ch] font-[var(--font-title-family)] text-[clamp(3.4rem,10vw,7.8rem)] font-light leading-[0.9] tracking-[-0.035em] text-white [text-shadow:0_8px_32px_rgba(0,0,0,0.45)]"
        >
          {t.categoriesPage.hero.title}
        </motion.h1>

        <motion.button
          {...enter(0.34)}
          type="button"
          aria-expanded={isDescriptionOpen}
          aria-controls={descriptionId}
          onClick={() => setIsDescriptionOpen((value) => !value)}
          className="group mt-7 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/18"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`h-5 w-5 transition duration-300 ${
              isDescriptionOpen ? "rotate-180" : ""
            }`}
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">
            {isDescriptionOpen ? "Hide description" : "Show description"}
          </span>
        </motion.button>

        <AnimatePresence mode="popLayout" initial={false}>
          {isDescriptionOpen && (
            <motion.div
              id={descriptionId}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: PUBLIC_MOTION_DURATION.fast, ease: PUBLIC_MOTION_EASE }}
              className="mt-5 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/[0.12] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_58px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:px-8"
            >
              <p className="font-[var(--font-accent-family)] text-[clamp(1rem,1.6vw,1.18rem)] italic leading-[1.65] text-white/82">
                {t.categoriesPage.hero.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          {...enter(0.44)}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <HeroPrimaryButton href="/apply">
            {t.common.applyAsParticipant}
          </HeroPrimaryButton>

          <HeroSecondaryButton href="#categories">
            {t.common.browseCategories}
          </HeroSecondaryButton>
        </motion.div>
      </div>
    </section>
  );
}
