"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LandingSecondaryButton } from "@/shared/components/public";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CategoriesAbout() {
  const { t } = useLanguage();

  return (
    <motion.section
      className="landing-photo-section relative min-h-[760px] overflow-hidden bg-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/editorial/items.jpg"
          alt="Editorial category story from the event floor"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "75% center" }}
          priority={false}
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,rgba(255,255,255,0.96)_18%,rgba(255,255,255,0.72)_34%,rgba(255,255,255,0.22)_52%,rgba(255,255,255,0)_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.86)_24%,rgba(255,255,255,0.52)_42%,rgba(255,255,255,0)_64%)]" />
      </div>

      <motion.div
        className="relative z-10 mx-auto grid min-h-[760px] max-w-[1280px] grid-cols-1 items-center px-[var(--page-gutter)] py-[clamp(5rem,9vw,8rem)] lg:grid-cols-[0.44fr_0.56fr]"
      >
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: PUBLIC_MOTION_EASE }}
          viewport={{ once: true, margin: "-12% 0px" }}
          className="order-1 max-w-[510px] text-center lg:text-left"
        >
          <p className="page-eyebrow justify-center lg:justify-start">
            {t.categoriesPage.copy.association}
          </p>

          <h2 className="mt-5 font-[var(--font-title-family)] text-[clamp(3.2rem,7vw,6.6rem)] font-light leading-[0.88] tracking-[-0.055em] text-[var(--color-ink)] text-balance">
            {t.categoriesPage.copy.associationTitle}
          </h2>

          <p className="mt-7 max-w-[33rem] text-[clamp(1rem,1.35vw,1.12rem)] leading-[1.9] text-[var(--color-ink-soft)]">
            {t.categoriesPage.copy.associationText}
          </p>

          <blockquote className="mt-8 max-w-[34rem] border-l border-[var(--color-hover-accent)]/55 pl-5 text-left font-[var(--font-accent-family)] text-[clamp(1.05rem,1.65vw,1.32rem)] italic leading-[1.8] text-[var(--color-ink-soft)]">
            {t.categoriesPage.copy.associationQuote}
          </blockquote>

          <div className="mt-10 flex justify-center lg:justify-start">
            <LandingSecondaryButton href="/grand-prix">
              {t.categoriesPage.copy.associationButton}
            </LandingSecondaryButton>
          </div>
        </motion.div>

        <div className="order-2 hidden lg:block" />
      </motion.div>
    </motion.section>
  );
}
