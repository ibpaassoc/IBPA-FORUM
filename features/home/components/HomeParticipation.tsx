"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star, Trophy, Zap } from "lucide-react";

import { PRICING } from "@/data/pricing";
import TicketModal from "@/features/tickets/components/TicketModal";
import { applyDiscountToPrice } from "@/features/tickets/types";
import type { EarlyBirdStatus } from "@/features/tickets/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

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

  const forumPrice =
    applyDiscountToPrice(rawForumPrice, discount) ?? rawForumPrice;

  const awardPrice =
    tier === "ibpa"
      ? PRICING.awardParticipation.ibpaMembers.oneNomination
      : PRICING.awardParticipation.nonMembers.oneNomination;

  const judgePrice =
    tier === "ibpa"
      ? PRICING.judgeRegistration.ibpaMembers
      : PRICING.judgeRegistration.standard;

  return (
    <section className="section-rhythm-loose bg-[var(--surface)]">
      <div className="page-section">
        <Reveal className="mb-[var(--space-xl)]">
          <p className="page-eyebrow">{p.eyebrow}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="group relative min-h-[720px] overflow-hidden rounded-[36px] border border-[#b9d9eb]/55 bg-white shadow-[0_34px_110px_rgba(17,24,39,0.10)]">
            <Image
              src="/images/events/HomeHero.jpg"
              alt="Beauty Business Forum"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/5" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/34 via-white/8 to-white/0" />
            <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-white via-white/82 to-transparent" />

            <div className="relative flex min-h-[720px] flex-col justify-between p-7 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full border border-white/70 bg-white/85 px-5 py-2 font-[var(--font-ui-family)] text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                  {p.tickets.label}
                </span>

                {discount && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b9d9eb]/70 bg-white/85 px-5 py-2 font-[var(--font-ui-family)] text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#5f91b4] shadow-[0_12px_32px_rgba(114,160,193,0.18)] backdrop-blur-xl">
                    <Zap size={12} />
                    Early Bird
                  </span>
                )}
              </div>

              <div className="grid items-end gap-5 lg:grid-cols-[1fr_0.92fr]">
                <div className="max-w-[500px]">

                  <h3 className="mt-3 max-w-[460px] font-[var(--font-title-family)] text-[clamp(2.5rem,4.4vw,4.8rem)] font-light leading-[0.92] text-[var(--color-ink)]">
                    Beauty Business Forum
                  </h3>

                  <div className="mt-5 flex items-end gap-3">
                    {discount && (
                      <span className="mb-2 font-[var(--font-title-family)] text-[1.65rem] text-[var(--color-ink)]/35 line-through">
                        {rawForumPrice}
                      </span>
                    )}

                    <motion.span
                      key={forumPrice}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="font-[var(--font-title-family)] text-[clamp(3.2rem,5vw,5rem)] font-light leading-none text-[#6f9fbe]"
                    >
                      {forumPrice}
                    </motion.span>
                  </div>

                  <p className="mt-4 max-w-[430px] text-[0.94rem] leading-7 text-[var(--color-ink-soft)]">
                    Access the forum, connect with beauty professionals, and join the main IBPA business program.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                    className="group/btn relative mt-7 inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-[#72a0c1]/50 bg-[#72a0c1] px-8 py-4 font-[var(--font-ui-family)] text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_42px_rgba(114,160,193,0.32)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:bg-[#5f91b4] hover:shadow-[0_24px_60px_rgba(114,160,193,0.42)]"
                  >
                    <span className="absolute inset-0 before:absolute before:left-[-130%] before:top-0 before:h-full before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-all before:duration-700 group-hover/btn:before:left-[130%]" />
                    <span className="relative z-10">{p.tickets.cta}</span>
                    <ArrowRight
                      size={15}
                      className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1"
                    />
                  </button>
                </div>

                <div className="grid max-w-[440px] gap-3 sm:grid-cols-2 lg:justify-self-end lg:pb-3">
                  <OverlayPricingCard
                    href="/apply"
                    icon={<Trophy size={17} strokeWidth={1.6} />}
                    title={p.award.label}
                    price={awardPrice}
                    cta={p.award.cta}
                  />

                  <OverlayPricingCard
                    href="/jury"
                    icon={<Star size={17} strokeWidth={1.6} />}
                    title={p.judge.label}
                    price={judgePrice}
                    cta={p.judge.cta}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </section>
  );
}

function OverlayPricingCard({
  href,
  icon,
  title,
  price,
  cta,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  price: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group/card relative min-h-[210px] overflow-hidden rounded-[26px] border border-white/65 bg-white/44 p-4 shadow-[0_18px_50px_rgba(17,24,39,0.09)] backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-1 hover:border-[#b9d9eb]/80 hover:bg-white/68 hover:shadow-[0_24px_70px_rgba(114,160,193,0.20)]"
    >
      <span className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/20 to-[#b9d9eb]/14 opacity-80 transition-opacity duration-700 group-hover/card:opacity-100" />
      <span className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/0 to-transparent transition-all duration-700 group-hover/card:via-[#72a0c1]/75" />
      <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#b9d9eb]/0 blur-3xl transition-all duration-700 group-hover/card:bg-[#b9d9eb]/40" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#6f9fbe] shadow-[0_10px_26px_rgba(114,160,193,0.14)] backdrop-blur-xl transition-all duration-700 group-hover/card:scale-105 group-hover/card:border-[#72a0c1]/80 group-hover/card:bg-white group-hover/card:text-[#4f86aa]">
              {icon}
            </span>

            <p className="max-w-[130px] font-[var(--font-ui-family)] text-[0.58rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink-soft)]">
              {title}
            </p>
          </div>

          <div className="mt-5 flex items-end gap-2">
            <span className="mb-1.5 text-[0.72rem] text-[var(--color-ink-soft)]">
              From
            </span>

            <motion.span
              key={price}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="font-[var(--font-title-family)] text-[3.1rem] font-light leading-none text-[var(--color-ink)]"
            >
              {price}
            </motion.span>
          </div>
        </div>

        <span className="group/btn relative mt-5 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-[#72a0c1]/50 bg-[#72a0c1] px-4 py-3 font-[var(--font-ui-family)] text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_14px_32px_rgba(114,160,193,0.24)] transition-all duration-700 group-hover/card:bg-[#5f91b4] group-hover/card:shadow-[0_18px_44px_rgba(114,160,193,0.34)]">
          <span className="absolute inset-0 before:absolute before:left-[-130%] before:top-0 before:h-full before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-all before:duration-700 group-hover/card:before:left-[130%]" />
          <span className="relative z-10 line-clamp-1">{cta}</span>
          <ArrowRight
            size={13}
            className="relative z-10 shrink-0 transition-transform duration-500 group-hover/card:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
