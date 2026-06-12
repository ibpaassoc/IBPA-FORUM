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
  "cursor-pointer border border-[var(--border-default)] bg-white shadow-[var(--shadow-sm)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]";

const iconClass =
  "border border-[var(--border-default)] bg-[var(--surface-muted)] transition-[border-color,transform] duration-300 group-hover:border-[var(--border-strong)]";

const listWrapClass =
  "border border-[var(--border-soft)] bg-[var(--surface-muted)]";

const nominationClass =
  "border border-[var(--border-soft)] bg-white shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--border-default)] hover:shadow-[var(--shadow-md)]";
  
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
        layout
        transition={layoutTransition}
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.996 }}
        className={`group relative min-h-[132px] overflow-hidden rounded-[var(--radius)] p-0.5 text-left ${
          isOpen ? "z-20" : "z-10"
        } ${cardClass}`}
      >
        <button
          type="button"
          onClick={() => handleToggle(direction.slug)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          aria-label={`${direction.title} (${direction.nominations.length})`}
          className="absolute inset-0 z-20 rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover-accent)] focus-visible:ring-offset-2"
        />

        <div className="relative rounded-[calc(var(--radius-lg)-4px)] p-4">
          <div className="relative flex w-full items-start gap-3.5">
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-hover-accent)] transition-transform duration-200 group-hover:scale-105 ${iconClass}`}
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
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
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
                  className={`mt-4 space-y-2.5 rounded-[var(--radius-sm)] p-3 ${listWrapClass}`}
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
                          className={`rounded-[var(--radius-sm)] px-3.5 py-2.5 sm:px-4 sm:py-3 ${nominationClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="min-w-[1.8rem] font-[var(--font-ui-family)] text-[0.88rem] font-semibold tracking-[0.12em] text-[var(--color-hover-accent)]">
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
