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
import { motion, type Variants, useReducedMotion } from "framer-motion";

import { categoryCatalog } from "@/features/applications/config/category-catalog";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  PUBLIC_MOTION_EASE,
  PUBLIC_MOTION_DURATION,
} from "@/shared/components/public/motion-tokens";

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

const categoryOrder = categoryCatalog.map((c) => c.slug);

type Direction = {
  slug: string;
  title: string;
  nominations: string[];
};

// Custom variant — receives the individual card delay via the `custom` prop
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: PUBLIC_MOTION_DURATION.base,
      ease: PUBLIC_MOTION_EASE,
      delay,
    },
  }),
};

// Each column div propagates the "hidden"→"visible" state to its motion.article children
const colVariants: Variants = {
  hidden: {},
  visible: {},
};

const STAGGER = 0.06;

export default function CategoriesFeatures() {
  const { t } = useLanguage();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const directions = useMemo(() => {
    return [...t.categoriesPage.directions].sort((a, b) => {
      const ai = categoryOrder.indexOf(a.slug);
      const bi = categoryOrder.indexOf(b.slug);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [t.categoriesPage.directions]);

  // Split into left / right columns (original layout-isolated approach)
  const leftDirections = directions.filter((_, i) => i % 2 === 0);
  const rightDirections = directions.filter((_, i) => i % 2 === 1);

  const handleToggle = (slug: string) => {
    setOpenSlug((cur) => (cur === slug ? null : slug));
  };

  // colIndex = position within the column; readingIndex = visual reading order
  const renderCard = (direction: Direction, readingIndex: number) => {
    const isOpen = openSlug === direction.slug;
    const Icon = categoryIconBySlug[direction.slug] ?? Award;
    const contentId = `dir-${direction.slug}`;
    const delay = reducedMotion ? 0 : readingIndex * STAGGER;

    return (
      <motion.article
        key={direction.slug}
        variants={cardVariants}
        custom={delay}
        whileHover={
          reducedMotion
            ? undefined
            : {
                y: -3,
                transition: {
                  duration: PUBLIC_MOTION_DURATION.fast,
                  ease: PUBLIC_MOTION_EASE,
                },
              }
        }
        style={{ willChange: "opacity, transform" }}
        className={[
          "group relative overflow-hidden rounded-[2rem] p-px",
          "shadow-[0_18px_56px_rgba(15,23,42,0.06)] backdrop-blur-xl",
          "transition-shadow duration-200",
          isOpen
            ? "bg-[linear-gradient(135deg,rgba(114,160,193,0.72),rgba(255,255,255,0.9),rgba(185,217,235,0.64))] shadow-[0_24px_72px_rgba(114,160,193,0.18)]"
            : "bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(185,217,235,0.34),rgba(255,255,255,0.72))]",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(185,217,235,0.42),transparent_38%)]" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[var(--color-blue-light)]/28 blur-2xl" />

        <button
          type="button"
          onClick={() => handleToggle(direction.slug)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          aria-label={`${direction.title} (${direction.nominations.length})`}
          className="absolute inset-0 z-20 rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover-accent)] focus-visible:ring-offset-2"
        />

        <div className="relative rounded-[calc(2rem-1px)] bg-white/[0.66] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-6">
          <div className="flex items-start gap-4">
            <span
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem]",
                "border border-[var(--color-blue)]/20 bg-white/70 text-[var(--color-hover-accent)]",
                "shadow-[0_18px_40px_rgba(114,160,193,0.16),inset_0_1px_0_rgba(255,255,255,0.9)]",
                "transition duration-200",
                isOpen ? "-rotate-3 scale-[1.02]" : "",
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
                "shadow-sm backdrop-blur-xl transition duration-200",
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

          {isOpen && (
            <div id={contentId} className="overflow-hidden">
              <motion.ol
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: PUBLIC_MOTION_DURATION.fast,
                  ease: PUBLIC_MOTION_EASE,
                }}
                className="mt-6 space-y-2.5 rounded-[1.35rem] border border-white/75 bg-white/50 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl"
              >
                {direction.nominations.map((nomination, ni) => (
                  <li
                    key={`${direction.slug}-${ni}`}
                    className="rounded-[1.05rem] border border-white/70 bg-white/76 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:border-[var(--color-blue)]/30 hover:bg-white/90"
                  >
                    <div className="flex items-start gap-3">
                      <span className="min-w-[2rem] font-[var(--font-ui-family)] text-[0.78rem] font-semibold tracking-[0.14em] text-[var(--color-hover-accent)]">
                        {String(ni + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-6 text-[var(--color-ink-soft)]">
                        {nomination}
                      </span>
                    </div>
                  </li>
                ))}
              </motion.ol>
            </div>
          )}
        </div>
      </motion.article>
    );
  };

  return (
    <section
      id="categories"
      className="relative mt-[clamp(3rem,7vw,7rem)] overflow-hidden px-[var(--page-gutter)] pb-10 pt-3 sm:pb-14 sm:pt-4"
    >
      <div className="pointer-events-none absolute left-1/2 top-16 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--color-blue-light)]/18 blur-2xl" />
      <div className="pointer-events-none absolute right-[-12rem] top-72 h-[24rem] w-[24rem] rounded-full bg-[var(--color-blue)]/6 blur-2xl" />

      <div className="relative mx-auto grid max-w-[1040px] grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {/*
          Each column is an isolated flex-col so card expansion in one column
          doesn't shift the other. Both columns share the same whileInView trigger
          so they start animating together; individual card delays create the
          reading-order (left-right, top-bottom) cascade.
        */}
        <motion.div
          variants={colVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px", amount: 0.05 }}
          className="flex flex-col gap-4 md:gap-5"
        >
          {leftDirections.map((dir, ci) =>
            // reading order: 0, 2, 4, 6, …
            renderCard(dir, ci * 2)
          )}
        </motion.div>

        <motion.div
          variants={colVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px", amount: 0.05 }}
          className="flex flex-col gap-4 md:gap-5"
        >
          {rightDirections.map((dir, ci) =>
            // reading order: 1, 3, 5, 7, …
            renderCard(dir, ci * 2 + 1)
          )}
        </motion.div>
      </div>
    </section>
  );
}
