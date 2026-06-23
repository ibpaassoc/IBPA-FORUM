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
import { AnimatePresence, motion } from "framer-motion";

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

const layoutTransition = {
  duration: 0.58,
  ease: [0.22, 1, 0.36, 1],
} as const;

const cardTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
} as const;

const itemTransition = {
  duration: 0.36,
  ease: [0.22, 1, 0.36, 1],
} as const;

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
        transition={{ layout: layoutTransition }}
        whileHover={{ y: -5, scale: 1.006 }}
        whileTap={{ scale: 0.992 }}
        className={`group relative overflow-hidden rounded-[1.65rem] border p-px text-left shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-colors duration-300 ${
          isOpen
            ? "z-20 border-[var(--color-blue)]/45 bg-[linear-gradient(135deg,rgba(114,160,193,0.55),rgba(255,255,255,0.55),rgba(185,217,235,0.45))] shadow-[0_28px_90px_rgba(114,160,193,0.24)]"
            : "z-10 border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,252,255,0.62),rgba(185,217,235,0.18))] hover:border-[var(--color-blue)]/35"
        }`}
      >
        <motion.div
          aria-hidden="true"
          animate={{
            opacity: isOpen ? 1 : 0.55,
            scale: isOpen ? 1.12 : 1,
          }}
          transition={cardTransition}
          className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[var(--color-blue-lightest)]/45 blur-3xl"
        />

        <motion.div
          aria-hidden="true"
          animate={{
            opacity: isOpen ? 0.9 : 0,
            x: isOpen ? 0 : -20,
          }}
          transition={cardTransition}
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        />

        <button
          type="button"
          onClick={() => handleToggle(direction.slug)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          aria-label={`${direction.title} (${direction.nominations.length})`}
          className="absolute inset-0 z-20 rounded-[1.65rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover-accent)] focus-visible:ring-offset-2"
        />

        <div className="relative rounded-[calc(1.65rem-1px)] bg-white/[0.58] p-5 backdrop-blur-2xl">
          <div className="relative flex w-full items-start gap-4">
            <motion.span
              layout
              animate={{
                rotate: isOpen ? -4 : 0,
                scale: isOpen ? 1.08 : 1,
              }}
              transition={cardTransition}
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-blue)]/25 bg-white/55 text-[var(--color-hover-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_34px_rgba(114,160,193,0.16)] backdrop-blur-xl"
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </motion.span>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-[var(--font-title-family)] text-[clamp(1.22rem,1.7vw,1.62rem)] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
                {direction.title}
              </h3>

              <p className="mt-1.5 font-[var(--font-ui-family)] text-[0.58rem] uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
                {`${String(direction.nominations.length).padStart(2, "0")} ${
                  direction.nominations.length === 1
                    ? t.categoriesPage.copy.nominationSingular
                    : t.categoriesPage.copy.nominationPlural
                }`}
              </p>
            </div>

            <motion.span
              aria-hidden="true"
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={cardTransition}
              className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-blue)]/20 bg-white/45 text-[var(--color-hover-accent)] opacity-0 shadow-sm backdrop-blur-xl transition-opacity duration-300 group-hover:opacity-100"
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
            </motion.span>
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            {isOpen && (
              <motion.div
                layout
                id={contentId}
                initial={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                exit={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                transition={{
                  height: layoutTransition,
                  opacity: { duration: 0.28 },
                  filter: { duration: 0.28 },
                }}
                className="overflow-hidden"
              >
                <motion.ol
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    closed: {
                      opacity: 0,
                      transition: {
                        staggerChildren: 0.018,
                        staggerDirection: -1,
                      },
                    },
                    open: {
                      opacity: 1,
                      transition: {
                        delayChildren: 0.08,
                        staggerChildren: 0.045,
                      },
                    },
                  }}
                  className="relative mt-5 flex flex-col gap-2.5 rounded-[1.25rem] border border-[var(--color-blue)]/22 bg-white/38 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] backdrop-blur-2xl"
                >
                  {direction.nominations.map(
                    (nomination, nominationIndex) => (
                      <motion.li
                        key={`${direction.slug}-${nominationIndex}`}
                        layout
                        variants={{
                          closed: { opacity: 0, y: 10, scale: 0.98 },
                          open: { opacity: 1, y: 0, scale: 1 },
                        }}
                        transition={itemTransition}
                      >
                        <div className="rounded-[1rem] border border-white/65 bg-white/66 px-3.5 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.045)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-blue)]/35 hover:bg-white/82 hover:shadow-[0_16px_38px_rgba(114,160,193,0.14)] sm:px-4">
                          <div className="flex items-start gap-3">
                            <span className="min-w-[1.9rem] font-[var(--font-ui-family)] text-[0.82rem] font-semibold tracking-[0.12em] text-[var(--color-hover-accent)]">
                              {String(nominationIndex + 1).padStart(2, "0")}
                            </span>

                            <span className="min-w-0 text-sm leading-6 text-[var(--color-ink-soft)]">
                              {nomination}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    )
                  )}
                </motion.ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>
    );
  };

  return (
    <section className="relative mt-[clamp(3rem,7vw,7rem)] min-h-[950px] overflow-hidden px-[var(--page-gutter)] pb-5 pt-3 sm:pb-7 sm:pt-4">
      <div className="pointer-events-none absolute left-1/2 top-20 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[var(--color-blue-lightest)]/20 blur-3xl" />

      <motion.div
        layout
        transition={{ layout: layoutTransition }}
        className="relative mx-auto grid max-w-[1040px] grid-cols-1 gap-4 overflow-visible md:grid-cols-2 md:gap-5"
      >
        <motion.div
          layout
          transition={{ layout: layoutTransition }}
          className="flex flex-col gap-4 md:gap-5"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {leftDirections.map(renderDirectionCard)}
          </AnimatePresence>
        </motion.div>

        <motion.div
          layout
          transition={{ layout: layoutTransition }}
          className="flex flex-col gap-4 md:gap-5"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {rightDirections.map(renderDirectionCard)}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
