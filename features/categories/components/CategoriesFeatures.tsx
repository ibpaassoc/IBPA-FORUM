"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Brush,
  Camera,
  Gem,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  SprayCan,
  Trophy,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import { categoryCatalog } from "@/features/applications/config/category-catalog";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const categoryIconBySlug: Record<string, LucideIcon> = {
  hair: SprayCan,
  nail: Gem,
  brow: Brush,
  lash: Sparkles,
  "skin-cosmetology-facial": HeartHandshake,
  "makeup-artistry": Camera,
  "permanent-makeup": Award,
  "body-wellness-nutrition": Users,
  education: GraduationCap,
  salon: Trophy,
  brand: BookOpen,
};

const categoryOrder = categoryCatalog.map((category) => category.slug);

type Direction = {
  slug: string;
  title: string;
  nominations: string[];
};

const listVariants: Variants = {
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
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

function splitDirections(directions: Direction[]) {
  return {
    leftDirections: directions.filter((_, index) => index % 2 === 0),
    rightDirections: directions.filter((_, index) => index % 2 === 1),
  };
}

export default function CategoriesFeatures() {
  const { t } = useLanguage();
  const [openDirectionSlug, setOpenDirectionSlug] = useState<string | null>(
    null
  );

  const directions = useMemo(() => {
    return [...t.categoriesPage.directions].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.slug);
      const bIndex = categoryOrder.indexOf(b.slug);

      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }, [t.categoriesPage.directions]);

  const { leftDirections, rightDirections } = useMemo(
    () => splitDirections(directions),
    [directions]
  );

  const handleToggle = (slug: string) => {
    setOpenDirectionSlug((current) => (current === slug ? null : slug));
  };

  const renderDirectionCard = (direction: Direction) => {
    const isOpen = openDirectionSlug === direction.slug;
    const Icon = categoryIconBySlug[direction.slug] ?? Award;
    const contentId = `direction-content-${direction.slug}`;

    return (
      <motion.article
        key={direction.slug}
        layout
        variants={cardVariants}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={[
          "group relative overflow-hidden rounded-[2rem] p-px",
          "shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-2xl",
          "transition-shadow duration-500",
          isOpen
            ? "bg-[linear-gradient(135deg,rgba(114,160,193,0.85),rgba(255,255,255,0.9),rgba(185,217,235,0.75))] shadow-[0_36px_110px_rgba(114,160,193,0.24)]"
            : "bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(185,217,235,0.34),rgba(255,255,255,0.72))]",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(185,217,235,0.42),transparent_38%)]" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[var(--color-blue-lightest)]/50 blur-3xl transition duration-700 group-hover:scale-125" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-44 w-44 rounded-full bg-white/80 blur-3xl transition duration-700 group-hover:scale-125" />

        <button
          type="button"
          onClick={() => handleToggle(direction.slug)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          aria-label={`${direction.title} (${direction.nominations.length})`}
          className="absolute inset-0 z-20 rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover-accent)] focus-visible:ring-offset-2"
        />

        <div className="relative rounded-[calc(2rem-1px)] bg-white/[0.62] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-6">
          <div className="flex items-start gap-4">
            <span
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem]",
                "border border-[var(--color-blue)]/20 bg-white/70 text-[var(--color-hover-accent)]",
                "shadow-[0_18px_40px_rgba(114,160,193,0.16),inset_0_1px_0_rgba(255,255,255,0.9)]",
                "transition duration-300",
                isOpen ? "-rotate-6 scale-105" : "",
              ].join(" ")}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="max-w-[17rem] font-[var(--font-title-family)] text-[clamp(1.22rem,1.75vw,1.7rem)] leading-[1.04] tracking-[-0.035em] text-[var(--color-ink)]">
                {direction.title}
              </h3>

              <p className="mt-2 font-[var(--font-ui-family)] text-[0.6rem] uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
                {`${String(direction.nominations.length).padStart(2, "0")} ${
                  direction.nominations.length === 1
                    ? t.categoriesPage.copy.nominationSingular
                    : t.categoriesPage.copy.nominationPlural
                }`}
              </p>
            </div>

            <span
              aria-hidden="true"
              className={[
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                "border border-[var(--color-blue)]/18 bg-white/60 text-[var(--color-hover-accent)]",
                "shadow-sm backdrop-blur-xl transition duration-300",
                isOpen ? "rotate-180 opacity-100" : "opacity-55",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                id={contentId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <ol className="mt-6 space-y-2.5 rounded-[1.35rem] border border-white/75 bg-white/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl">
                  {direction.nominations.map(
                    (nomination, nominationIndex) => (
                      <li
                        key={`${direction.slug}-${nominationIndex}`}
                        className="rounded-[1.05rem] border border-white/70 bg-white/72 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-blue)]/30 hover:bg-white/90"
                      >
                        <div className="flex items-start gap-3">
                          <span className="min-w-[2rem] font-[var(--font-ui-family)] text-[0.78rem] font-semibold tracking-[0.14em] text-[var(--color-hover-accent)]">
                            {String(nominationIndex + 1).padStart(2, "0")}
                          </span>

                          <span className="text-sm leading-6 text-[var(--color-ink-soft)]">
                            {nomination}
                          </span>
                        </div>
                      </li>
                    )
                  )}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>
    );
  };

  return (
    <section className="relative mt-[clamp(3rem,7vw,7rem)] overflow-hidden px-[var(--page-gutter)] pb-10 pt-3 sm:pb-14 sm:pt-4">
      <div className="pointer-events-none absolute left-1/2 top-16 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--color-blue-lightest)]/24 blur-3xl" />
      <div className="pointer-events-none absolute right-[-12rem] top-72 h-[28rem] w-[28rem] rounded-full bg-[var(--color-blue)]/8 blur-3xl" />

      <motion.div
        variants={listVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative mx-auto grid max-w-[1040px] grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
      >
        <motion.div layout className="flex flex-col gap-4 md:gap-5">
          {leftDirections.map(renderDirectionCard)}
        </motion.div>

        <motion.div layout className="flex flex-col gap-4 md:gap-5">
          {rightDirections.map(renderDirectionCard)}
        </motion.div>
      </motion.div>
    </section>
  );
}
