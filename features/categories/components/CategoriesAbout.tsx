"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { EditorialPhotoCard } from "@/shared/components/public";

const lowerSectionTransition = {
  type: "spring",
  stiffness: 520,
  damping: 48,
  mass: 0.65,
} as const;

export default function CategoriesAbout() {
  const { t } = useLanguage();

  return (
    <motion.section
      layout
      transition={lowerSectionTransition}
      className="py-[clamp(4rem,9vw,8rem)]"
      style={{ background: "var(--surface-blue-tint)" }}
    >
      <motion.div
        layout
        transition={lowerSectionTransition}
        className="mx-auto grid max-w-[1120px] gap-[clamp(2rem,5vw,4rem)] px-[var(--page-gutter)] lg:grid-cols-[0.82fr_1.18fr] lg:items-center"
      >
        <motion.div
          layout
          transition={lowerSectionTransition}
          className="mx-auto w-full max-w-[520px] lg:order-2"
        >
          <EditorialPhotoCard
            src="/images/events/CategoriesAbout.jpeg"
            alt="Editorial category story from the event floor"
            aspect="portrait"
            overlay="soft"
            objectPosition="center 38%"
            mobileObjectPosition="center 22%"
            className="overflow-hidden rounded-[var(--radius-lg)] shadow-[0_28px_80px_rgba(37,42,45,0.12)]"
          />
        </motion.div>

        <motion.div
          layout
          transition={lowerSectionTransition}
          className="text-center lg:order-1 lg:text-left"
        >
          <p className="page-eyebrow justify-center lg:justify-start">
            {t.categoriesPage.copy.association}
          </p>

          <h2 className="mt-[var(--space-sm)] text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.95] tracking-[-0.035em] text-[var(--color-ink)] text-balance">
            {t.categoriesPage.copy.associationTitle}
          </h2>

          <p className="mt-[var(--space-md)] text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.85] text-[var(--color-ink-soft)]">
            {t.categoriesPage.copy.associationText}
          </p>

          <blockquote className="mt-[var(--space-lg)] max-w-[38rem] border-l-2 border-[var(--color-hover-accent)] pl-[var(--space-md)] font-[var(--font-accent-family)] text-[clamp(1.05rem,1.8vw,1.35rem)] italic leading-[1.75] text-[var(--color-ink-soft)]">
            {t.categoriesPage.copy.associationQuote}
          </blockquote>

          <div className="mt-[var(--space-xl)] flex justify-center lg:justify-start">
            <a
              href="https://ibpassociations.org/about"
              target="_blank"
              rel="noreferrer"
              className="ibpa-button ibpa-button-ghost"
            >
              {t.categoriesPage.copy.associationButton}
            </a>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
