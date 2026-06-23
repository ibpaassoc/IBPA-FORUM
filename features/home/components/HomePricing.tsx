"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Star, Ticket, Trophy, Zap } from "lucide-react";

import { PRICING } from "@/data/pricing";
import { applyDiscountToPrice } from "@/features/tickets/types";
import type { EarlyBirdStatus } from "@/features/tickets/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

type Tier = "ibpa" | "standard";
type PricingOption = "tickets" | "award" | "judge";

function PriceRow({
  label,
  value,
  discountedValue,
}: {
  label: string;
  value: string;
  discountedValue?: string | null;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#b9d9eb]/35 py-4 last:border-0">
      <span className="text-[0.92rem] text-[var(--color-ink-soft)]">{label}</span>

      <div className="flex items-baseline gap-2">
        {discountedValue ? (
          <>
            <span className="text-[0.78rem] text-[var(--color-ink-soft)] line-through">
              {value}
            </span>
            <span className="font-[var(--font-title-family)] text-[1.35rem] font-medium text-[var(--color-blue)]">
              {discountedValue}
            </span>
          </>
        ) : (
          <span className="font-[var(--font-title-family)] text-[1.35rem] font-medium text-[var(--color-ink)]">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

function ButtonLayers() {
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
      <span className="absolute inset-x-8 top-[1px] h-[45%] rounded-full bg-gradient-to-b from-white/80 to-transparent" />
      <span className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/70 to-transparent opacity-60" />
      <span className="absolute inset-[1px] rounded-full border border-white/60" />
      <span className="absolute inset-0 before:absolute before:left-[-130%] before:top-0 before:h-full before:w-[40%] before:rotate-[18deg] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent before:transition-all before:duration-1000 group-hover:before:left-[140%]" />
      <span className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(114,160,193,0.08)]" />
    </>
  );
}

export default function HomePricing({
  tier,
  onBuyTickets,
  earlyBird,
}: {
  tier: Tier;
  onBuyTickets?: () => void;
  earlyBird: EarlyBirdStatus;
}) {
  const { t } = useLanguage();
  const ps = t.home.pricingSection;

  const [active, setActive] = useState<PricingOption>("tickets");
  const [direction, setDirection] = useState(1);

  const discount = earlyBird.enabled ? earlyBird.discount : null;

  const forumPrices =
    tier === "ibpa"
      ? PRICING.forumTickets.ibpaMembers
      : PRICING.forumTickets.standard;

  const awardPrices =
    tier === "ibpa"
      ? PRICING.awardParticipation.ibpaMembers
      : PRICING.awardParticipation.nonMembers;

  const judgePrice =
    tier === "ibpa"
      ? PRICING.judgeRegistration.ibpaMembers
      : PRICING.judgeRegistration.standard;

  const options = useMemo(
    () => [
      {
        key: "tickets" as const,
        label: "Tickets",
        title: ps.forumTickets,
        eyebrow: "Forum Access",
        icon: Ticket,
        cta: t.home.participation.tickets.cta,
        href: null,
        note: discount ? "Gala dinner price not discounted." : "Choose your forum pass.",
        rows: [
          {
            label: ps.oneDayPass,
            value: forumPrices.oneDay,
            discountedValue: applyDiscountToPrice(forumPrices.oneDay, discount),
          },
          {
            label: ps.twoDayPass,
            value: forumPrices.twoDays,
            discountedValue: applyDiscountToPrice(forumPrices.twoDays, discount),
          },
          {
            label: ps.galaDinner,
            value: forumPrices.galaDinner,
            discountedValue: null,
          },
        ],
      },
      {
        key: "award" as const,
        label: "Award",
        title: ps.awardParticipation,
        eyebrow: "Nomination Pricing",
        icon: Trophy,
        cta: t.home.participation.award.cta,
        href: "/apply",
        note: ps.grandPrixNote,
        rows: [
          { label: ps.oneNomination, value: awardPrices.oneNomination },
          { label: ps.threeNominations, value: awardPrices.threeNominations },
          { label: ps.fiveNominations, value: awardPrices.fiveNominations },
        ],
      },
      {
        key: "judge" as const,
        label: "Judge",
        title: ps.judgeRegistration,
        eyebrow: tier === "ibpa" ? "IBPA Member Fee" : "Judge Registration",
        icon: Star,
        cta: t.home.participation.judge.cta,
        href: "/jury",
        note: ps.judgePaidAfterApproval,
        rows: [
          {
            label: tier === "ibpa" ? ps.ibpaMembers : ps.standard,
            value: judgePrice,
          },
        ],
      },
    ],
    [ps, t.home.participation, discount, forumPrices, awardPrices, judgePrice, tier],
  );

  const activeIndex = options.findIndex((option) => option.key === active);
  const current = options[activeIndex];

  const handleSelect = (key: PricingOption) => {
    const nextIndex = options.findIndex((option) => option.key === key);
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActive(key);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.985,
      filter: "blur(16px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.985,
      filter: "blur(16px)",
    }),
  };

  const ctaClass =
    "group relative inline-flex min-h-[56px] w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,252,255,0.72))] px-8 py-4 font-[var(--font-ui-family)] text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#24394b] backdrop-blur-[30px] shadow-[0_1px_0_rgba(255,255,255,0.95),0_10px_30px_rgba(122,152,175,0.10),0_24px_60px_rgba(122,152,175,0.16),inset_0_1px_0_rgba(255,255,255,0.85)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:scale-[1.01] hover:border-[#8eb6d3]/70 hover:shadow-[0_2px_0_rgba(255,255,255,1),0_18px_50px_rgba(122,152,175,0.18),0_40px_90px_rgba(114,160,193,0.20)]";

  return (
    <section className="section-rhythm-loose relative overflow-hidden bg-transparent">
      <div className="page-section">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#b9d9eb]/45 bg-white/[0.28] p-3 shadow-[0_28px_80px_rgba(20,49,71,0.08)] backdrop-blur-2xl">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

            <div className="relative mx-auto mb-5 flex w-full max-w-2xl rounded-full border border-[#b9d9eb]/60 bg-white/60 p-1.5 shadow-[0_10px_40px_rgba(122,152,175,0.10)] backdrop-blur-2xl">
              <motion.div
                layout
                aria-hidden
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="pointer-events-none absolute inset-y-1.5 rounded-full border border-[#8eb6d3]/55 bg-gradient-to-b from-white/95 via-[#fafdff] to-[#eef7fc] shadow-[0_0_0_1px_rgba(255,255,255,0.65),0_8px_24px_rgba(122,152,175,0.15),0_0_36px_rgba(122,152,175,0.18)] backdrop-blur-xl"
                style={{
                  left: `calc(${activeIndex} * 33.333% + 6px)`,
                  width: "calc(33.333% - 8px)",
                }}
              >
                <span className="absolute inset-x-5 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-[#72a0c1]/90 to-transparent" />
                <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
                <span className="absolute inset-x-6 top-[2px] h-[40%] rounded-full bg-gradient-to-b from-white/70 to-transparent" />
              </motion.div>

              {options.map((option) => {
                const isActive = active === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleSelect(option.key)}
                    className={`relative z-10 min-w-0 flex-1 rounded-full px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all duration-500 ${
                      isActive
                        ? "text-[#24394b]"
                        : "text-[var(--color-ink-soft)] hover:text-[#24394b]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="relative overflow-hidden rounded-[2.1rem] border border-white/70 bg-white/[0.42] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-2xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.article
                  key={current.key}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.46, ease: [0.19, 1, 0.22, 1] }}
                  className="rounded-[1.85rem] border border-white/65 bg-white/[0.34] p-5 backdrop-blur-2xl md:p-8"
                >
                  <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
                    <div className="flex flex-col justify-between rounded-[1.6rem] border border-white/55 bg-white/[0.28] p-6 backdrop-blur-xl">
                      <div>
                        <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                          {current.eyebrow}
                        </p>

                        <h3 className="max-w-[9ch] font-[var(--font-title-family)] text-[clamp(2.65rem,5vw,4.25rem)] font-light leading-[0.95] text-[var(--color-ink)]">
                          {current.title}
                        </h3>

                        {active === "tickets" && discount && (
                          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/50 bg-white/58 px-3.5 py-2 text-[0.72rem] font-semibold text-[var(--color-ink-soft)] shadow-[0_8px_24px_rgba(122,152,175,0.10)] backdrop-blur-xl">
                            <Zap size={13} className="text-[var(--color-blue)]" />
                            <span>
                              <span className="text-[var(--color-blue)]">Early Bird</span>
                              {discount.type === "percent"
                                ? ` — ${discount.value}% off`
                                : ` — $${(discount.value / 100).toFixed(0)} off`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8">
                        {current.href ? (
                          <Link href={current.href} className={ctaClass}>
                            <ButtonLayers />
                            <span className="relative z-10">{current.cta}</span>
                            <ArrowRight
                              size={16}
                              className="relative z-10 text-[#72a0c1] transition-all duration-500 group-hover:translate-x-1.5 group-hover:scale-110"
                            />
                          </Link>
                        ) : (
                          <button type="button" onClick={onBuyTickets} className={ctaClass}>
                            <ButtonLayers />
                            <span className="relative z-10">{current.cta}</span>
                            <ArrowRight
                              size={16}
                              className="relative z-10 text-[#72a0c1] transition-all duration-500 group-hover:translate-x-1.5 group-hover:scale-110"
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center rounded-[1.6rem] border border-white/60 bg-white/[0.36] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl md:p-7">
                      <div>
                        {current.rows.map((row) => (
                          <PriceRow
                            key={row.label}
                            label={row.label}
                            value={row.value}
                            discountedValue={"discountedValue" in row ? row.discountedValue : null}
                          />
                        ))}
                      </div>

                      <div className="mt-5 flex items-start gap-2 rounded-full border border-white/65 bg-[#f4fbff]/70 px-4 py-3 text-[0.76rem] italic text-[var(--color-ink-soft)] backdrop-blur-xl">
                        <Check size={15} className="mt-0.5 shrink-0 text-[var(--color-blue)]" />
                        <span>{current.note}</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
