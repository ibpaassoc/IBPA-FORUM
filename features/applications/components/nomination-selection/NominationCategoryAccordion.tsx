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
};

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

  const layoutTransition = reducedMotion
    ? { duration: 0 }
    : { duration: PUBLIC_MOTION_DURATION.slow, ease: PUBLIC_MOTION_EASE };
  const contentTransition = reducedMotion
    ? { duration: 0 }
    : { duration: PUBLIC_MOTION_DURATION.base, ease: PUBLIC_MOTION_EASE };
  const categoryPairs = Array.from(
    { length: Math.ceil(categories.length / 2) },
    (_, pairIndex) => categories.slice(pairIndex * 2, pairIndex * 2 + 2),
  );

  return (
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reducedMotion ? 0 : 0.045 },
        },
      }}
      className={`flex flex-col gap-4 lg:gap-5 ${className}`}
    >
      {categoryPairs.map((pair, pairIndex) => (
        <motion.div
          layout={reducedMotion ? false : true}
          key={`category-pair-${pairIndex}`}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: reducedMotion ? 0 : 0.045 },
            },
          }}
          transition={{ layout: layoutTransition }}
          className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5"
        >
          {pair.map((category) => {
            const isOpen = openCategoryId === category.id;
            const selectedInCategory = category.awards.filter((award) => selectedAwards.has(award.id)).length;
            const Icon = categoryIconBySlug[category.slug] ?? Award;
            const contentId = `nomination-category-${category.id}`;

            return (
              <motion.article
                layout={reducedMotion ? false : true}
                key={category.id}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ ...contentTransition, layout: layoutTransition }}
                className={`relative self-start overflow-hidden rounded-[2rem] border bg-white/78 p-px backdrop-blur-2xl ${
                  isOpen
                    ? "border-[rgba(114,160,193,0.56)] shadow-[0_28px_76px_rgba(114,160,193,0.2)] lg:order-first lg:col-span-2"
                    : "border-white/90 shadow-[0_18px_52px_rgba(79,115,139,0.09)]"
                }`}
              >
            <div className="pointer-events-none absolute right-5 top-4 size-28 rounded-full bg-[rgba(185,217,235,0.18)] blur-2xl" />
            <div className="relative rounded-[calc(2rem-1px)] border border-[rgba(114,160,193,0.1)] bg-white/72 backdrop-blur-xl">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => onOpenCategoryChange(isOpen ? null : category.id)}
                  className="block min-h-[142px] w-full rounded-[calc(2rem-1px)] px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[rgba(114,160,193,0.3)] sm:px-6"
                >
                  <motion.div layout="position" className="flex min-h-[100px] items-stretch justify-between gap-4">
                    <span className="flex min-w-0 items-start gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px] border border-[rgba(114,160,193,0.2)] bg-white/86 text-[#5689ad] shadow-[0_12px_28px_rgba(114,160,193,0.12)]">
                        <Icon aria-hidden className="size-[17px]" />
                      </span>
                      <span className="flex min-w-0 flex-col justify-center">
                        <span className="block max-w-xl break-words font-[var(--font-title-family)] text-[clamp(1.28rem,2.3vw,1.85rem)] font-light leading-[1.04] tracking-[-0.035em] text-[var(--color-ink)]">
                          {category.displayName}
                        </span>
                        <span className="mt-2 block text-[0.76rem] text-[var(--color-ink-soft)]">
                          {category.awards.length} {category.awards.length === 1 ? copy.nominationSingular : copy.nominationPlural}
                          {selectedInCategory > 0 ? (
                            <span className="ml-2 font-semibold text-[#5689ad]">
                              · {selectedInCategory} {copy.selected}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </span>

                    <span className="flex shrink-0 flex-col items-end justify-between">
                      {selectedInCategory > 0 ? (
                        <span className="inline-flex size-7 items-center justify-center rounded-full border border-[rgba(114,160,193,0.24)] bg-[#edf6fb] text-[0.68rem] font-bold text-[#477b9f]">
                          {selectedInCategory}
                        </span>
                      ) : null}
                      <motion.span
                        aria-hidden
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={contentTransition}
                        className="flex size-9 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/84 text-[#6391b1] shadow-sm"
                      >
                        <ChevronDown size={17} />
                      </motion.span>
                    </span>
                  </motion.div>
                </button>
              </h3>

              <AnimatePresence initial={false} mode="popLayout">
                {isOpen ? (
                  <motion.div
                    id={contentId}
                    key="nomination-content"
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    transition={contentTransition}
                    className="px-5 pb-5 sm:px-6 sm:pb-6"
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
                      className="grid grid-cols-1 gap-3 border-t border-[rgba(114,160,193,0.16)] pt-5 md:grid-cols-2 xl:grid-cols-3"
                    >
                      {category.awards.map((award, awardIndex) => {
                        const selected = selectedAwards.has(award.id);
                        const commonClassName = `group/nomination flex h-full min-h-[94px] w-full items-start justify-between gap-3 rounded-[20px] border p-4 text-left backdrop-blur-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)] ${
                          selected
                            ? "border-[rgba(114,160,193,0.6)] bg-[#edf6fb] text-[var(--color-ink)] shadow-[0_14px_36px_rgba(114,160,193,0.18)]"
                            : "border-[rgba(114,160,193,0.2)] bg-white/82 text-[var(--color-ink-soft)] shadow-[0_10px_28px_rgba(79,115,139,0.06)] hover:border-[rgba(114,160,193,0.44)] hover:bg-[#f5fafc] hover:text-[var(--color-ink)]"
                        }`;
                        const label = (
                          <>
                            <span className="flex min-w-0 flex-1 flex-col self-stretch justify-between gap-3">
                              <span className="break-words text-sm leading-snug">{award.displayName}</span>
                              {getAwardHref && copy.continueToApplication ? (
                                <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.11em] text-[#6391b1]">
                                  {copy.continueToApplication}
                                  <ArrowUpRight aria-hidden size={12} />
                                </span>
                              ) : null}
                            </span>
                            <span
                              aria-hidden
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[rgba(114,160,193,0.5)] bg-white text-[#477b9f]"
                                  : "border-[rgba(114,160,193,0.28)] bg-white/90 text-transparent"
                              }`}
                            >
                              {getAwardHref ? <ArrowUpRight size={13} /> : <Check size={13} strokeWidth={3} />}
                            </span>
                          </>
                        );

                        return (
                          <motion.div
                            key={award.id}
                            layout={reducedMotion ? false : "position"}
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ ...contentTransition, delay: reducedMotion ? 0 : awardIndex * 0.005 }}
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
            </div>
              </motion.article>
            );
          })}
        </motion.div>
      ))}
    </motion.div>
  );
}
