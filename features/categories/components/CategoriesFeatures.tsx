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

const cardClass =
  "cursor-pointer border border-[rgba(114,160,193,0.28)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96)_0%,rgba(244,248,251,0.92)_100%)] shadow-[0_14px_36px_rgba(37,42,45,0.09)] transition-[border-color,box-shadow,background] duration-300 hover:border-[rgba(114,160,193,0.58)] hover:bg-[linear-gradient(145deg,rgba(255,255,255,1)_0%,rgba(239,247,252,0.98)_100%)] hover:shadow-[0_22px_60px_rgba(37,42,45,0.14)]";

const iconClass =
  "border border-[rgba(114,160,193,0.28)] bg-white shadow-[0_8px_20px_rgba(114,160,193,0.16)] transition-[border-color,box-shadow,transform] duration-300 group-hover:border-[rgba(114,160,193,0.68)] group-hover:shadow-[0_10px_28px_rgba(114,160,193,0.22)]";

const listWrapClass =
  "border border-[rgba(114,160,193,0.22)] bg-[rgba(255,255,255,0.64)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]";

const nominationClass =
  "border border-[rgba(114,160,193,0.18)] bg-white shadow-[0_8px_22px_rgba(37,42,45,0.07)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[rgba(114,160,193,0.42)] hover:shadow-[0_12px_28px_rgba(37,42,45,0.1)]";
  
const layoutTransition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

const openTransition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

const itemTransition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;

function splitDirections(
  directions: Direction[],
  openDirectionSlug: string | null
) {
  const openIndex = directions.findIndex((d) => d.slug === openDirectionSlug);

  const openIsLeft = openIndex !== -1 && openIndex % 2 === 0;

  let shiftedIndex: number | null = null;

  if (openIsLeft) {
    const leftIndexes = directions
      .map((_, i) => i)
      .filter((i) => i % 2 === 0);

    const lastLeftIndex = leftIndexes[leftIndexes.length - 1];

    shiftedIndex =
      openIndex === lastLeftIndex
        ? leftIndexes[leftIndexes.length - 2] ?? null
        : leftIndexes.find((i) => i > openIndex) ?? null;
  }

  return {
    leftDirections: directions.filter(
      (_, index) => index % 2 === 0 && index !== shiftedIndex
    ),

    rightDirections: directions.filter(
      (_, index) => index % 2 === 1 || index === shiftedIndex
    ),
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
    () => splitDirections(directions, openDirectionSlug),
    [directions, openDirectionSlug]
  );

  const handleToggle = (slug: string) => {
    setOpenDirectionSlug((current) =>
      current === slug ? null : slug
    );
  };

  const renderDirectionCard = (direction: Direction) => {
    const isOpen = openDirectionSlug === direction.slug;

    const Icon = categoryIconBySlug[direction.slug] ?? Award;

    const contentId = `direction-content-${direction.slug}`;

    return (
      <motion.article
        key={direction.slug}
        layout="position"
        layoutId={`direction-card-${direction.slug}`}
        transition={layoutTransition}
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.996 }}
        className={`group relative min-h-[132px] overflow-hidden rounded-[var(--radius-lg)] p-0.5 text-left ${
          isOpen ? "z-20" : "z-10"
        } ${cardClass}`}
      >
        <button
          type="button"
          onClick={() => handleToggle(direction.slug)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          aria-label={`${direction.title} (${direction.nominations.length})`}
          className="absolute inset-0 z-20 rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover)] focus-visible:ring-offset-2"
        />

        <div className="relative rounded-[calc(var(--radius-lg)-4px)] p-4">
          <div className="relative flex w-full items-start gap-3.5">
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-hover)] transition-transform duration-200 group-hover:scale-105 ${iconClass}`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-[var(--font-display)] text-[clamp(1.18rem,1.7vw,1.58rem)] leading-[1.05] text-[var(--color-ink)]">
                {direction.title}
              </h3>

              <p className="mt-1.5 font-[var(--font-ui-family)] text-[0.58rem] uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
                {`${String(direction.nominations.length).padStart(2, "0")} ${
                  direction.nominations.length === 1
                    ? t.categoriesPage.copy.nominationSingular
                    : t.categoriesPage.copy.nominationPlural
                }`}
              </p>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isOpen ? (
              <motion.div
                id={contentId}
                initial={{ height: 0, opacity: 0, y: -4 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -4 }}
                transition={openTransition}
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
                        staggerChildren: 0.008,
                        staggerDirection: -1,
                      },
                    },

                    open: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.022,
                        delayChildren: 0.015,
                      },
                    },
                  }}
                  className={`mt-4 space-y-2.5 rounded-[17px] p-3 ${listWrapClass}`}
                >
                  {direction.nominations.map(
                    (nomination, nominationIndex) => (
                      <motion.li
                        key={`${direction.slug}-${nominationIndex}`}
                        variants={{
                          closed: { opacity: 0, y: 4 },
                          open: { opacity: 1, y: 0 },
                        }}
                        transition={itemTransition}
                      >
                        <div
                          className={`rounded-[14px] px-3.5 py-2.5 sm:px-4 sm:py-3 ${nominationClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="min-w-[1.8rem] font-[var(--font-ui-family)] text-[0.88rem] tracking-[0.12em] text-[rgba(114,160,193,0.88)]">
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
            ) : null}
          </AnimatePresence>
        </div>
      </motion.article>
    );
  };

  return (
    <section
      className="
        relative
        mt-[clamp(3rem,7vw,7rem)]
        px-[var(--page-gutter)]
        pt-3 pb-5
        sm:pb-7 sm:pt-4
        min-h-[950px]
      "
    >
      <motion.div
        layout="position"
        transition={layoutTransition}
        className="
          mx-auto grid max-w-[1020px]
          grid-cols-1 gap-3
          overflow-visible
          md:grid-cols-2 md:gap-4
        "
      >
        <motion.div
          layout="position"
          transition={layoutTransition}
          className="flex flex-col gap-3 md:gap-4"
        >
          <AnimatePresence initial={false}>
            {leftDirections.map(renderDirectionCard)}
          </AnimatePresence>
        </motion.div>

        <motion.div
          layout="position"
          transition={layoutTransition}
          className="flex flex-col gap-3 md:gap-4"
        >
          <AnimatePresence initial={false}>
            {rightDirections.map(renderDirectionCard)}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
