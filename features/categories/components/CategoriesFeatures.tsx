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
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import { PageSection } from "@/shared/components/public";

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

const directionOrder = [
  "hair",
  "nail",
  "brow",
  "lash",
  "skin-cosmetology-facial",
  "makeup-artistry",
  "permanent-makeup",
  "body-wellness-nutrition",
  "education",
  "salon",
  "brand",
] as const;

const unifiedCardSurfaceClass =
  "border-[rgba(126,136,151,0.44)] bg-[linear-gradient(145deg,rgba(233,239,245,0.98)_0%,rgba(208,217,227,0.96)_100%)] shadow-[0_14px_28px_rgba(63,74,90,0.18),inset_0_1px_0_rgba(250,253,255,0.8)]";

const unifiedMedallionClass =
  "border-[rgba(126,136,151,0.45)] bg-[linear-gradient(145deg,rgba(245,250,255,0.94)_0%,rgba(208,219,231,0.84)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_16px_rgba(72,84,97,0.2)]";

export default function CategoriesFeatures() {
  const { t } = useLanguage();
  const [openDirectionSlug, setOpenDirectionSlug] = useState<string | null>(null);

  const directions = useMemo(() => {
    return [...t.categoriesPage.directions].sort((a, b) => {
      const aIndex = directionOrder.indexOf(a.slug as (typeof directionOrder)[number]);
      const bIndex = directionOrder.indexOf(b.slug as (typeof directionOrder)[number]);
      const normalizedAIndex = aIndex === -1 ? 999 : aIndex;
      const normalizedBIndex = bIndex === -1 ? 999 : bIndex;
      return normalizedAIndex - normalizedBIndex;
    });
  }, [t.categoriesPage.directions]);

  const handleToggle = (slug: string) => {
    setOpenDirectionSlug((current) => (current === slug ? null : slug));
  };

  return (
    <PageSection>
      <section className="relative overflow-hidden rounded-[30px] bg-[var(--color-off-white)] px-2 pb-5 pt-3 sm:px-3 sm:pb-7 sm:pt-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(227,211,185,0.32)_0%,rgba(227,211,185,0.07)_45%,rgba(227,211,185,0)_74%)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-[5%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(170,191,208,0.28)_0%,rgba(170,191,208,0.06)_46%,rgba(170,191,208,0)_76%)] blur-3xl"
        />

        <motion.div
          layout
          transition={{ duration: 0.34, ease: PUBLIC_MOTION_EASE }}
          className="mx-auto grid max-w-[1020px] grid-cols-1 items-start gap-3 md:grid-cols-2 md:gap-4"
        >
          {directions.map((direction) => {
            const isOpen = openDirectionSlug === direction.slug;
            const Icon = categoryIconBySlug[direction.slug] ?? Award;
            const contentId = `direction-content-${direction.slug}`;

            return (
              <motion.article
                key={direction.slug}
                layout
                transition={{ duration: 0.36, ease: PUBLIC_MOTION_EASE }}
                className={`relative min-h-[132px] self-start overflow-hidden rounded-[24px] border p-0.5 text-left transition-[transform,box-shadow,border-color] duration-300 [transition-timing-function:var(--motion-editorial)] hover:-translate-y-1 ${
                  isOpen ? "z-20" : "z-10"
                } ${unifiedCardSurfaceClass}`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(direction.slug)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  aria-label={`${direction.title} (${direction.nominations.length})`}
                  className="absolute inset-0 z-10 rounded-[21px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                />

                <div className="pointer-events-none rounded-[21px] border border-transparent bg-[rgba(255,255,255,0.08)] p-3.5 sm:p-4">
                  <div className="flex w-full items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[var(--color-hover)] ${unifiedMedallionClass}`}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-[var(--font-display)] text-[clamp(1.16rem,1.8vw,1.72rem)] leading-[1.04] text-[var(--color-ink)]">
                        {direction.title}
                      </h3>
                      <p className="mt-1.5 font-[var(--font-ui-family)] text-[0.58rem] uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
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
                        key={contentId}
                        initial={{ height: 0, opacity: 0, y: -8 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -4 }}
                        transition={{ duration: 0.3, ease: PUBLIC_MOTION_EASE }}
                        className="overflow-hidden"
                      >
                        <motion.ol
                          initial="hidden"
                          animate="show"
                          variants={{
                            hidden: {},
                            show: {
                              transition: { staggerChildren: 0.06, delayChildren: 0.04 },
                            },
                          }}
                          className="mt-4 space-y-2.5 rounded-[15px] border border-[rgba(126,136,151,0.32)] bg-[linear-gradient(145deg,rgba(236,242,248,0.98)_0%,rgba(211,220,230,0.96)_100%)] p-3 shadow-[0_12px_22px_rgba(63,74,90,0.18)]"
                        >
                          {direction.nominations.map((nomination, nominationIndex) => (
                            <motion.li
                              key={`${direction.slug}-${nominationIndex}`}
                              variants={{
                                hidden: { opacity: 0, y: 8 },
                                show: { opacity: 1, y: 0 },
                              }}
                              transition={{ duration: 0.26, ease: PUBLIC_MOTION_EASE }}
                            >
                              <div className="rounded-[14px] border border-[rgba(107,110,113,0.24)] bg-[linear-gradient(145deg,rgba(241,241,238,0.95)_0%,rgba(225,224,220,0.92)_100%)] px-3.5 py-2.5 shadow-[inset_0_1px_5px_rgba(255,255,255,0.4),0_6px_14px_rgba(46,45,43,0.15)] sm:px-4 sm:py-3">
                                <div className="flex items-start gap-3">
                                  <span className="min-w-[1.8rem] font-[var(--font-ui-family)] text-[0.9rem] tracking-[0.12em] text-[rgba(114,160,193,0.85)]">
                                    {String(nominationIndex + 1).padStart(2, "0")}
                                  </span>
                                  <span className="min-w-0 text-sm leading-6 text-[var(--color-ink-soft)]">
                                    {nomination}
                                  </span>
                                </div>
                              </div>
                            </motion.li>
                          ))}
                        </motion.ol>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </section>
    </PageSection>
  );
}
