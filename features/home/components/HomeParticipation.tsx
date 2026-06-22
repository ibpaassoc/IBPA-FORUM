"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";
import { PRICING } from "@/data/pricing";
import { Trophy, Star, CheckCircle, Zap } from "lucide-react";
import TicketModal from "@/features/tickets/components/TicketModal";
import { applyDiscountToPrice } from "@/features/tickets/types";
import type { EarlyBirdStatus } from "@/features/tickets/types";

type Tier = "ibpa" | "standard";

export default function HomeParticipation({
  tier,
  earlyBird,
}: {
  tier: Tier;
  earlyBird: EarlyBirdStatus;
}) {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { t } = useLanguage();
  const p = t.home.participation;

  const discount = earlyBird.enabled ? earlyBird.discount : null;

  const rawForumPrice =
    tier === "ibpa"
      ? PRICING.forumTickets.ibpaMembers.oneDay
      : PRICING.forumTickets.standard.oneDay;

  const forumPrice = applyDiscountToPrice(rawForumPrice, discount) ?? rawForumPrice;

  const awardPrice =
    tier === "ibpa"
      ? PRICING.awardParticipation.ibpaMembers.oneNomination
      : PRICING.awardParticipation.nonMembers.oneNomination;

  const judgePrice =
    tier === "ibpa"
      ? PRICING.judgeRegistration.ibpaMembers
      : PRICING.judgeRegistration.standard;

  const ps = t.home.pricingSection;
  const tierLabel = tier === "ibpa" ? ps.ibpaMembers : ps.standard;

  return (
    <section className="section-rhythm-loose bg-[var(--surface)]">
      <div className="page-section">
        <Reveal className="mb-[var(--space-xl)]">
          <p className="page-eyebrow">{p.eyebrow}</p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr]">

          {/* Forum Tickets dominant card — keeps photo, lightened overlay */}
          <Reveal delay={0.05} className="md:row-span-2">
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(true)}
              className="premium-glass group relative flex h-full min-h-[480px] w-full flex-col text-left lg:min-h-[560px]"
            >
              <Image
                src="/images/events/HomeHero.jpg"
                alt="Forum Tickets"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 700px"
                className="object-cover opacity-68 transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Blur gradient on BOTTOM half only — top is clear */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/55 to-transparent" style={{ top: "50%" }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-white/96 via-white/70 to-transparent" />

              <div className="relative flex h-full flex-col justify-between p-[var(--space-lg)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-[var(--radius-sm)] border border-[var(--color-blue)]/30 bg-white/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
                    {p.tickets.mostPopular}
                  </span>
                  {discount ? (
                    <span className="flex items-center gap-1 rounded-full border border-[var(--color-blue-soft)] bg-white/80 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-[var(--color-blue)]">
                      <Zap size={10} strokeWidth={2.5} /> Early Bird
                    </span>
                  ) : (
                    <Star size={18} className="text-[var(--color-blue)] opacity-70" strokeWidth={1.5} />
                  )}
                </div>

                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-blue)]">
                    {p.tickets.label}
                  </p>
                  <h3 className="mt-2 font-[var(--font-body-family)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.05] text-[var(--color-ink)]">
                    {ps.startingFrom}
                    <br />
                    <div className="flex items-baseline gap-3">
                      {discount && (
                        <span className="text-[clamp(1.4rem,3vw,2.5rem)] font-light text-[var(--color-ink)]/40 line-through">
                          {rawForumPrice}
                        </span>
                      )}
                      <motion.span
                        key={forumPrice}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className={`text-[clamp(2.4rem,5vw,4rem)] font-medium ${discount ? "text-[var(--color-blue)]" : ""}`}
                      >
                        {forumPrice}
                      </motion.span>
                    </div>
                  </h3>

                  <div className="mt-[var(--space-md)] flex flex-wrap gap-x-4 gap-y-2">
                    {p.tickets.features.split("·").map((item) => (
                      <span key={item} className="flex items-center gap-1.5 text-[0.82rem] text-[var(--color-ink-soft)]">
                        <CheckCircle size={13} strokeWidth={2} className="text-[var(--color-blue)]" />
                        {item.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="mt-[var(--space-lg)]">
                    <span className="ibpa-button ibpa-button-blue inline-flex">
                      {p.tickets.cta}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </Reveal>

          {/* Award Participation — glassmorphic card */}
          <Reveal delay={0.1}>
            <Link
              href="/apply"
              className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border-glass)] bg-white/80 shadow-[var(--shadow-glass)] backdrop-blur-[16px] transition-all duration-300 hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-md)]"
            >
              {/* Header */}
              <div className="border-b border-[var(--border-soft)] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-blue)]/25 bg-[var(--color-blue-wash)]">
                    <Trophy size={16} className="text-[var(--color-blue)]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
                    {tierLabel}
                  </span>
                </div>
                <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                  {p.award.label}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-[0.7rem] text-[var(--color-ink-soft)]">{ps.startingFrom}</span>
                  <span className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-[var(--color-ink)]">
                    {awardPrice}
                  </span>
                </div>
              </div>

              {/* Included list */}
              <div className="flex-1 px-6 py-5">
                <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                  WHAT'S INCLUDED:
                </p>
                <ul className="space-y-2.5">
                  {[p.award.description, p.tickets?.mostPopular, ps.oneDayPass].filter(Boolean).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[0.84rem] leading-[1.55] text-[var(--color-ink-soft)]">
                      <CheckCircle size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--color-blue)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Value statement + CTA */}
              <div className="border-t border-[var(--border-soft)] px-6 py-5">
                <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                  VALUE STATEMENT:
                </p>
                <p className="mb-4 text-[0.83rem] leading-[1.6] text-[var(--color-ink-soft)]">
                  {p.award.description}
                </p>
                <span className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-[var(--font-ui-family)] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white shadow-lg transition-all duration-300 group-hover:scale-[1.03]">
                  {p.award.cta}
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Judge Registration — glassmorphic card */}
          <Reveal delay={0.16}>
            <Link
              href="/jury"
              className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border-glass)] bg-white/80 shadow-[var(--shadow-glass)] backdrop-blur-[16px] transition-all duration-300 hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-md)]"
            >
              {/* Header */}
              <div className="border-b border-[var(--border-soft)] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-blue)]/25 bg-[var(--color-blue-wash)]">
                    <Star size={16} className="text-[var(--color-blue)]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
                    {tierLabel}
                  </span>
                </div>
                <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                  {p.judge.label}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-[0.7rem] text-[var(--color-ink-soft)]">{ps.startingFrom}</span>
                  <span className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-[var(--color-ink)]">
                    {judgePrice}
                  </span>
                </div>
              </div>

              {/* Included list */}
              <div className="flex-1 px-6 py-5">
                <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                  WHAT'S INCLUDED:
                </p>
                <ul className="space-y-2.5">
                  {[p.judge.description, ps.perJudge, ps.judgePaidAfterApproval].filter(Boolean).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[0.84rem] leading-[1.55] text-[var(--color-ink-soft)]">
                      <CheckCircle size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--color-blue)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Value statement + CTA */}
              <div className="border-t border-[var(--border-soft)] px-6 py-5">
                <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                  VALUE STATEMENT:
                </p>
                <p className="mb-4 text-[0.83rem] leading-[1.6] text-[var(--color-ink-soft)]">
                  {p.judge.description}
                </p>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-transparent px-6 py-3 font-[var(--font-ui-family)] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink)] transition-all duration-300 group-hover:bg-[var(--color-ink)] group-hover:text-white">
                  {p.judge.cta}
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </section>
  );
}
