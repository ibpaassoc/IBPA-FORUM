"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";
import { PRICING } from "@/data/pricing";
import { Ticket, Trophy, Star, Zap } from "lucide-react";
import { applyDiscountToPrice } from "@/features/tickets/types";
import type { EarlyBirdStatus } from "@/features/tickets/types";

type Tier = "ibpa" | "standard";

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
    <div className="flex items-center justify-between border-b border-[var(--border-soft)] py-3 last:border-0">
      <span className="text-[0.88rem] text-[var(--color-ink-soft)]">{label}</span>
      <div className="flex flex-col items-end gap-0.5">
        {discountedValue ? (
          <>
            <span className="text-[0.72rem] text-[var(--color-ink-soft)] line-through">{value}</span>
            <motion.span
              key={discountedValue}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="font-[var(--font-title-family)] text-[1.1rem] font-medium text-[var(--color-blue)]"
            >
              {discountedValue}
            </motion.span>
          </>
        ) : (
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="font-[var(--font-title-family)] text-[1.1rem] font-medium text-[var(--color-ink)]"
          >
            {value}
          </motion.span>
        )}
      </div>
    </div>
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

  const discount = earlyBird.enabled ? earlyBird.discount : null;

  const forumPrices =
    tier === "ibpa"
      ? {
          oneDay: PRICING.forumTickets.ibpaMembers.oneDay,
          twoDays: PRICING.forumTickets.ibpaMembers.twoDays,
          galaDinner: PRICING.forumTickets.ibpaMembers.galaDinner,
        }
      : {
          oneDay: PRICING.forumTickets.standard.oneDay,
          twoDays: PRICING.forumTickets.standard.twoDays,
          galaDinner: PRICING.forumTickets.standard.galaDinner,
        };

  const forumRows = [
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
  ];

  const awardRows =
    tier === "ibpa"
      ? [
          { label: ps.oneNomination, value: PRICING.awardParticipation.ibpaMembers.oneNomination },
          { label: ps.threeNominations, value: PRICING.awardParticipation.ibpaMembers.threeNominations },
          { label: ps.fiveNominations, value: PRICING.awardParticipation.ibpaMembers.fiveNominations },
        ]
      : [
          { label: ps.oneNomination, value: PRICING.awardParticipation.nonMembers.oneNomination },
          { label: ps.threeNominations, value: PRICING.awardParticipation.nonMembers.threeNominations },
          { label: ps.fiveNominations, value: PRICING.awardParticipation.nonMembers.fiveNominations },
        ];

  const judgePrice =
    tier === "ibpa"
      ? PRICING.judgeRegistration.ibpaMembers
      : PRICING.judgeRegistration.standard;

  const rawForumStarting = tier === "ibpa"
    ? PRICING.forumTickets.ibpaMembers.oneDay
    : PRICING.forumTickets.standard.oneDay;

  const forumStarting = applyDiscountToPrice(rawForumStarting, discount) ?? rawForumStarting;

  const awardStarting =
    tier === "ibpa"
      ? PRICING.awardParticipation.ibpaMembers.oneNomination
      : PRICING.awardParticipation.nonMembers.oneNomination;

  return (
    <section className="section-rhythm-loose bg-[var(--surface-tint)]">
      <div className="page-section">
        <Reveal className="mb-[var(--space-xl)]">
          <p className="page-eyebrow mb-[var(--space-sm)]">{ps.eyebrow}</p>
          <h2 className="font-[var(--font-title-family)] text-[clamp(1.9rem,3.5vw,3rem)] font-light leading-[1.1] text-[var(--color-ink)]">
            {ps.title}
          </h2>
        </Reveal>

        {/* Early bird banner */}
        {discount && (
          <Reveal className="mb-6">
            <div className="premium-glass flex items-center gap-3 px-5 py-3.5">
              <Zap size={16} className="shrink-0 text-[var(--color-blue)]" strokeWidth={2} />
              <p className="text-[0.84rem] font-medium text-[var(--color-ink)]">
                <span className="font-semibold text-[var(--color-blue)]">Early Bird Pricing Active</span>
                {discount.type === "percent" && (
                  <span className="text-[var(--color-ink-soft)]"> — {discount.value}% off forum passes. Limited time only.</span>
                )}
                {discount.type === "amount" && (
                  <span className="text-[var(--color-ink-soft)]"> — ${(discount.value / 100).toFixed(0)} off forum passes. Limited time only.</span>
                )}
              </p>
            </div>
          </Reveal>
        )}

        <div className="grid gap-4 md:grid-cols-3">

          {/* ── Forum Tickets ── */}
          <Reveal delay={0.05}>
            <article className="premium-glass group flex h-full flex-col transition-all duration-300 hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-md)]">
              {/* Card header */}
              <div className="border-b border-[var(--border-soft)] p-[var(--space-md)]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-[var(--color-blue)]" strokeWidth={1.5} />
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)] transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                      {ps.forumTickets}
                    </span>
                  </div>
                  {discount && (
                    <span className="flex items-center gap-1 rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[var(--color-blue)]">
                      <Zap size={9} strokeWidth={2.5} />
                      Early Bird
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.72rem] text-[var(--color-ink-soft)]">{ps.from}</span>
                  {discount && (
                    <span className="text-[0.9rem] text-[var(--color-ink-soft)] line-through">{rawForumStarting}</span>
                  )}
                  <motion.span
                    key={forumStarting}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`font-[var(--font-title-family)] text-[2rem] font-light leading-none ${discount ? "text-[var(--color-blue)]" : "text-[var(--color-ink)]"}`}
                  >
                    {forumStarting}
                  </motion.span>
                  <span className="text-[0.72rem] text-[var(--color-ink-soft)]">{ps.perPerson}</span>
                </div>
              </div>

              {/* Rows */}
              <div className="flex-1 px-[var(--space-md)] pt-[var(--space-sm)]">
                {forumRows.map((row) => (
                  <PriceRow key={row.label} label={row.label} value={row.value} discountedValue={row.discountedValue} />
                ))}
                {discount && (
                  <p className="mt-2 text-[0.66rem] text-[var(--color-ink-soft)] italic">Gala dinner price not discounted</p>
                )}
              </div>

              <div className="p-[var(--space-md)]">
                <button
                  type="button"
                  onClick={onBuyTickets}
                  className="ibpa-button ibpa-button-blue w-full"
                >
                  {t.home.participation.tickets.cta}
                </button>
              </div>
            </article>
          </Reveal>

          {/* ── Award Participation ── */}
          <Reveal delay={0.1}>
            <article className="premium-glass group flex h-full flex-col transition-all duration-300 hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-md)]">
              <div className="border-b border-[var(--border-soft)] p-[var(--space-md)]">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy size={14} className="text-[var(--color-blue)]" strokeWidth={1.5} />
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)] transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                    {ps.awardParticipation}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.72rem] text-[var(--color-ink-soft)]">{ps.from}</span>
                  <motion.span
                    key={awardStarting}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-[var(--color-ink)]"
                  >
                    {awardStarting}
                  </motion.span>
                  <span className="text-[0.72rem] text-[var(--color-ink-soft)]">{ps.perNom}</span>
                </div>
              </div>

              <div className="flex-1 px-[var(--space-md)] pt-[var(--space-sm)]">
                {awardRows.map((row) => (
                  <PriceRow key={row.label} label={row.label} value={row.value} />
                ))}
                <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-blue-wash)] border border-[var(--color-blue-light)] px-3 py-2 text-[0.69rem] italic text-[var(--color-ink-soft)]">
                  {ps.grandPrixNote}
                </p>
              </div>

              <div className="p-[var(--space-md)]">
                <Link href="/apply" className="ibpa-button ibpa-button-blue w-full text-center">
                  {t.home.participation.award.cta}
                </Link>
              </div>
            </article>
          </Reveal>

          {/* ── Judge Registration ── */}
          <Reveal delay={0.15}>
            <article className="premium-glass group flex h-full flex-col transition-all duration-300 hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-md)]">
              <div className="border-b border-[var(--border-soft)] p-[var(--space-md)]">
                <div className="mb-3 flex items-center gap-2">
                  <Star size={14} className="text-[var(--color-blue)]" strokeWidth={1.5} />
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)] transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                    {ps.judgeRegistration}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.72rem] text-[var(--color-ink-soft)]">{ps.fee}</span>
                  <motion.span
                    key={judgePrice}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-[var(--color-ink)]"
                  >
                    {judgePrice}
                  </motion.span>
                  <span className="text-[0.72rem] text-[var(--color-ink-soft)]">{ps.perJudge}</span>
                </div>
              </div>

              <div className="flex-1 px-[var(--space-md)] pt-[var(--space-sm)]">
                <PriceRow
                  label={tier === "ibpa" ? ps.ibpaMembers : ps.standard}
                  value={judgePrice}
                />
                <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-blue-wash)] border border-[var(--color-blue-light)] px-3 py-2 text-[0.69rem] italic text-[var(--color-ink-soft)]">
                  {ps.judgePaidAfterApproval}
                </p>
              </div>

              <div className="p-[var(--space-md)]">
                <Link href="/jury" className="ibpa-button ibpa-button-blue w-full text-center">
                  {t.home.participation.judge.cta}
                </Link>
              </div>
            </article>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
