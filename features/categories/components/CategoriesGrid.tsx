"use client";

import { motion, type Variants } from "framer-motion";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageSection } from "@/shared/components/layout/PageShell";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.98,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function CategoriesGrid() {
  const { t } = useLanguage();
  const categories = t.home.categoriesPreview.items;

  return (
    <PageSection>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {categories.map((category, index) => (
          <motion.article
            key={category}
            variants={cardVariants}
            whileHover={{
              y: -8,
              scale: 1.015,
              transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            }}
            className="group relative min-h-[250px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/[0.72] p-px shadow-[0_22px_70px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition duration-500 hover:border-[var(--color-blue)]/35 hover:shadow-[0_30px_90px_rgba(114,160,193,0.18)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.48),rgba(185,217,235,0.24))]" />
            <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-[var(--color-blue-lightest)]/45 blur-3xl transition duration-700 group-hover:scale-125 group-hover:bg-[var(--color-blue)]/20" />
            <div className="pointer-events-none absolute -bottom-20 left-8 h-36 w-36 rounded-full bg-white/80 blur-3xl transition duration-700 group-hover:scale-125" />

            <div className="relative flex min-h-[250px] flex-col rounded-[calc(2rem-1px)] bg-white/[0.42] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-[var(--color-blue)]/18 bg-white/55 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.2em] text-[var(--color-blue)] shadow-sm backdrop-blur-xl">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-blue)]/35 shadow-[0_0_24px_rgba(114,160,193,0.65)] transition duration-500 group-hover:scale-125 group-hover:bg-[var(--color-blue)]" />
              </div>

              <div className="mt-auto pt-14">
                <h3 className="font-[var(--font-display)] text-[clamp(1.25rem,2vw,1.7rem)] font-normal leading-[1.05] tracking-[-0.03em] text-[var(--color-ink)]">
                  {category}
                </h3>

                <p className="mt-4 text-sm leading-[1.75] text-[var(--color-ink-soft)]">
                  {t.categoriesPage.cardText}
                </p>
              </div>

              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[var(--color-blue)]/25 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            </div>
          </motion.article>
        ))}
      </motion.div>
    </PageSection>
  );
}
