"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Brush,
  Camera,
  Check,
  ChevronDown,
  Gem,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  SprayCan,
  Trophy,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { PresentedNominationCategory } from "@/features/applications/components/nomination-selection/nomination-presentation";
import RegulationButton, {
  type RegulationButtonCopy,
} from "@/features/regulations/components/RegulationButton";
import type {
  RegulationAvailability,
  RegulationLanguage,
} from "@/features/regulations/types";
import {
  PUBLIC_MOTION_DURATION,
  PUBLIC_MOTION_EASE,
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

type AccordionCopy = {
  nominationSingular: string;
  nominationPlural: string;
  selected: string;
  continueToApplication?: string;
};

type NominationCategoryAccordionProps = {
  categories: PresentedNominationCategory[];
  openCategoryId: string | null;
  onOpenCategoryChange: (categoryId: string | null) => void;
  copy: AccordionCopy;
  selectedAwardIds?: string[];
  onAwardToggle?: (awardId: string) => void;
  getAwardHref?: (awardId: string) => string;
  focusAwardId?: string | null;
  className?: string;
  regulationsByCategory?: Record<string, RegulationAvailability>;
  regulationLanguage?: RegulationLanguage;
  regulationCopy?: RegulationButtonCopy;
};

const noRegulations: RegulationAvailability = { en: false, ru: false, ua: false };

export default function NominationCategoryAccordion({
  categories,
  openCategoryId,
  onOpenCategoryChange,
  copy,
  selectedAwardIds = [],
  onAwardToggle,
  getAwardHref,
  focusAwardId,
  className = "",
  regulationsByCategory,
  regulationLanguage,
  regulationCopy,
}: NominationCategoryAccordionProps) {
  const reducedMotion = useReducedMotion();
  const nominationRefs = useRef(new Map<string, HTMLElement>());
  const selectedAwards = new Set(selectedAwardIds);

  useEffect(() => {
    if (!focusAwardId || !openCategoryId) return;

    const frame = window.requestAnimationFrame(() => {
      nominationRefs.current.get(focusAwardId)?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusAwardId, openCategoryId, reducedMotion]);

  const surfaceTransition = reducedMotion
    ? { duration: 0 }
    : { duration: PUBLIC_MOTION_DURATION.slow, ease: PUBLIC_MOTION_EASE };
  const itemTransition = reducedMotion
    ? { duration: 0 }
    : { duration: PUBLIC_MOTION_DURATION.base, ease: PUBLIC_MOTION_EASE };

  return (
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.045 } },
      }}
      className={`flex flex-col gap-2.5 ${className}`}
    >
      {categories.map((category) => {
        const isOpen = openCategoryId === category.id;
        const selectedInCategory = category.awards.filter((award) =>
          selectedAwards.has(award.id),
        ).length;
        const Icon = categoryIconBySlug[category.slug] ?? Award;
        const contentId = `nomination-category-${category.id}`;
        const toggleCategory = () =>
          onOpenCategoryChange(isOpen ? null : category.id);

        return (
          <motion.article
            layout={reducedMotion ? false : "position"}
            key={category.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ ...itemTransition, layout: surfaceTransition }}
            className={`relative overflow-hidden rounded-[24px] border backdrop-blur-2xl transition-[border-color,box-shadow,background-color] duration-500 ${
              isOpen
                ? "border-[rgba(114,160,193,0.52)] bg-white/84 shadow-[0_22px_64px_rgba(87,137,173,0.18)]"
                : "border-white/90 bg-white/66 shadow-[0_12px_34px_rgba(55,92,118,0.07)] hover:border-[rgba(114,160,193,0.34)] hover:bg-white/78 hover:shadow-[0_18px_46px_rgba(87,137,173,0.12)]"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-12 -top-14 h-24 rounded-full bg-[rgba(185,217,235,0.22)] blur-3xl" />

            <h3 className="relative grid min-h-[82px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-3 sm:px-4">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={toggleCategory}
                className="group flex min-w-0 items-center gap-3 rounded-[18px] px-1 py-2 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.24)] sm:gap-4 sm:px-2"
              >
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-full border bg-white/76 text-[#5689ad] shadow-[0_10px_28px_rgba(114,160,193,0.11)] transition duration-500 group-hover:scale-[1.04] ${isOpen ? "border-[rgba(114,160,193,0.38)]" : "border-[rgba(114,160,193,0.18)]"}`}>
                  <Icon aria-hidden className="size-[18px]" strokeWidth={1.65} />
                </span>
                <span className="min-w-0">
                  <span className="block break-words font-[var(--font-title-family)] text-[clamp(1.2rem,2vw,1.55rem)] font-light leading-[1.08] tracking-[-0.025em] text-[var(--color-ink)]">
                    {category.displayName}
                  </span>
                  <span className="mt-1 block text-[0.74rem] leading-none text-[var(--color-ink-soft)]">
                    {category.awards.length}{" "}
                    {category.awards.length === 1
                      ? copy.nominationSingular
                      : copy.nominationPlural}
                    {selectedInCategory > 0 ? (
                      <span className="ml-2 font-semibold text-[#5689ad]">
                        · {selectedInCategory} {copy.selected}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>

              {regulationLanguage && regulationCopy ? (
                <RegulationButton
                  regulationKey={`category:${category.id}`}
                  availability={regulationsByCategory?.[category.id] ?? noRegulations}
                  language={regulationLanguage}
                  title={`${regulationCopy.regulations}: ${category.displayName}`}
                  copy={regulationCopy}
                  className="col-start-1 row-start-2 ml-[3.75rem] justify-self-start sm:col-start-2 sm:row-start-1 sm:ml-0"
                />
              ) : null}

              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={toggleCategory}
                className="col-start-2 row-start-1 flex size-10 items-center justify-center justify-self-end rounded-full border border-[rgba(114,160,193,0.16)] bg-white/72 text-[var(--color-ink)] shadow-[0_8px_22px_rgba(79,115,139,0.07)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.24)] sm:col-start-3"
              >
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={surfaceTransition}
                  className="flex"
                >
                  <ChevronDown aria-hidden size={17} strokeWidth={1.8} />
                </motion.span>
                <span className="sr-only">{category.displayName}</span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={contentId}
                  key="nomination-content"
                  initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={surfaceTransition}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={reducedMotion ? false : "hidden"}
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: reducedMotion ? 0 : 0.045 },
                      },
                    }}
                    className="mx-4 grid grid-cols-1 gap-3 border-t border-[rgba(114,160,193,0.15)] pb-5 pt-4 sm:mx-5 sm:grid-cols-2 sm:pb-6 sm:pt-5 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {category.awards.map((award) => {
                      const selected = selectedAwards.has(award.id);
                      const commonClassName = `group/nomination flex h-full min-h-[92px] w-full items-start justify-between gap-3 rounded-[18px] border p-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.24)] ${
                        selected
                          ? "border-[rgba(114,160,193,0.62)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(216,236,248,0.62))] text-[var(--color-ink)] shadow-[0_13px_30px_rgba(114,160,193,0.16)]"
                          : "border-[rgba(114,160,193,0.18)] bg-white/62 text-[var(--color-ink-soft)] shadow-[0_8px_22px_rgba(79,115,139,0.05)] hover:-translate-y-0.5 hover:border-[rgba(114,160,193,0.42)] hover:bg-white/88 hover:text-[var(--color-ink)]"
                      }`;
                      const label = (
                        <>
                          <span className="flex min-w-0 flex-1 flex-col self-stretch justify-between gap-3">
                            <span className="break-words text-[0.84rem] leading-snug">
                              {award.displayName}
                            </span>
                            {getAwardHref && copy.continueToApplication ? (
                              <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#6391b1]">
                                {copy.continueToApplication}
                                <ArrowUpRight aria-hidden size={11} />
                              </span>
                            ) : null}
                          </span>
                          <span aria-hidden className={`flex size-6 shrink-0 items-center justify-center rounded-full border bg-white/84 transition ${selected ? "border-[rgba(114,160,193,0.55)] text-[#477b9f]" : "border-[rgba(114,160,193,0.28)] text-transparent group-hover/nomination:text-[#76a0be]"}`}>
                            {getAwardHref ? <ArrowUpRight size={12} /> : <Check size={12} strokeWidth={3} />}
                          </span>
                        </>
                      );

                      return (
                        <motion.div
                          key={award.id}
                          variants={{
                            hidden: { opacity: 0, y: 8, scale: 0.985 },
                            visible: { opacity: 1, y: 0, scale: 1 },
                          }}
                          transition={itemTransition}
                          className="h-full"
                        >
                          {getAwardHref ? (
                            <Link
                              ref={(node) => {
                                if (node) nominationRefs.current.set(award.id, node);
                                else nominationRefs.current.delete(award.id);
                              }}
                              href={getAwardHref(award.id)}
                              aria-label={`${award.displayName}. ${copy.continueToApplication ?? ""}`.trim()}
                              className={commonClassName}
                            >
                              {label}
                            </Link>
                          ) : (
                            <button
                              ref={(node) => {
                                if (node) nominationRefs.current.set(award.id, node);
                                else nominationRefs.current.delete(award.id);
                              }}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => onAwardToggle?.(award.id)}
                              className={commonClassName}
                            >
                              {label}
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.article>
        );
      })}
    </motion.div>
  );
}
