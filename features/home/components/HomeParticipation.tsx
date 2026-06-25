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

const glassButtonClass =
  "group/btn relative inline-flex min-h-[54px] w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,252,255,0.76))] px-8 py-4 font-[var(--font-ui-family)] text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#0b1420] shadow-[0_1px_0_rgba(255,255,255,0.95),0_10px_30px_rgba(122,152,175,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[#8eb6d3]/70 hover:shadow-[0_14px_40px_rgba(122,152,175,0.15)] sm:w-auto";

const smallGlassButtonClass =
  "group/btn relative mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,252,255,0.76))] px-4 py-3 font-[var(--font-ui-family)] text-[0.56rem] font-semibold uppercase tracking-[0.13em] text-[#0b1420] shadow-[0_1px_0_rgba(255,255,255,0.95),0_8px_24px_rgba(122,152,175,0.11),inset_0_1px_0_rgba(255,255,255,0.85)] transition-all duration-200 group-hover/card:-translate-y-px group-hover/card:border-[#8eb6d3]/70 group-hover/card:shadow-[0_12px_34px_rgba(122,152,175,0.14)]";

function ButtonLayers() {
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
      <span className="absolute inset-x-8 top-[1px] h-[45%] rounded-full bg-gradient-to-b from-white/85 to-transparent" />
      <span className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/65 to-transparent opacity-70" />
      <span className="absolute inset-[1px] rounded-full border border-white/65" />
    </>
  );
}

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
          <div className="overflow-hidden rounded-[30px] border border-[#b9d9eb]/55 bg-white shadow-[0_28px_90px_rgba(17,24,39,0.09)] sm:rounded-[36px] lg:min-h-[720px]">
            <div className="relative min-h-[560px] overflow-hidden sm:min-h-[640px] lg:min-h-[720px]">
              <Image
                src="/images/gallery/DSC09871.jpg"
                alt="Beauty Business Forum"
                fill
                sizes="100vw"
                className="object-cover object-center opacity-90 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/56 to-white/10 sm:via-white/46 lg:via-white/40 lg:to-black/5" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/58 via-white/16 to-white/0" />
              <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-white via-white/88 to-transparent lg:h-[48%]" />

              <div className="relative z-10 flex min-h-[560px] flex-col justify-end p-6 sm:min-h-[640px] sm:p-8 lg:min-h-[720px] lg:justify-between lg:p-10">
                <div className="hidden items-center justify-between gap-4 lg:flex">
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
                  <div className="max-w-[500px] rounded-[2rem] border border-white/70 bg-white/58 p-5 shadow-[0_22px_70px_rgba(20,49,71,0.12)] backdrop-blur-2xl sm:p-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
                    <div className="mb-4 flex flex-wrap items-center gap-2 lg:hidden">
                      <span className="rounded-full border border-white/70 bg-white/80 px-4 py-2 font-[var(--font-ui-family)] text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)] shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                        {p.tickets.label}
                      </span>

                      {discount && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b9d9eb]/70 bg-white/80 px-4 py-2 font-[var(--font-ui-family)] text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#5f91b4] shadow-[0_10px_28px_rgba(114,160,193,0.14)] backdrop-blur-xl">
                          <Zap size={11} />
                          Early Bird
                        </span>
                      )}
                    </div>

                    <h3 className="max-w-[460px] font-[var(--font-title-family)] text-[clamp(2.35rem,10vw,4.8rem)] font-light leading-[0.92] text-[var(--color-ink)]">
                      Beauty Business Forum
                    </h3>

                    <div className="mt-5 flex flex-wrap items-end gap-3">
                      {discount && (
                        <span className="mb-2 font-[var(--font-title-family)] text-[1.45rem] text-[var(--color-ink)]/35 line-through sm:text-[1.65rem]">
                          {rawForumPrice}
                        </span>
                      )}

                      <motion.span
                        key={forumPrice}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="font-[var(--font-title-family)] text-[clamp(3.2rem,15vw,5rem)] font-light leading-none text-[#6f9fbe]"
                      >
                        {forumPrice}
                      </motion.span>
                    </div>

                    <p className="mt-4 max-w-[430px] text-[0.94rem] leading-7 text-[var(--color-ink-soft)]">
                      {p.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsTicketModalOpen(true)}
                      className={`${glassButtonClass} mt-7`}
                    >
                      <ButtonLayers />
                      <span className="relative z-10">{p.tickets.cta}</span>
                      <ArrowRight
                        size={15}
                        className="relative z-10 text-[#4d88b2] transition-all duration-200 group-hover/btn:translate-x-0.5"
                      />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:mt-0 lg:max-w-[440px] lg:justify-self-end lg:pb-3">
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

  const { t } = useLanguage()

  return (
    <Link
      href={href}
      className="group/card relative min-h-[190px] overflow-hidden rounded-[26px] border border-white/65 bg-white/62 p-4 shadow-[0_16px_44px_rgba(17,24,39,0.08)] backdrop-blur-2xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[#b9d9eb]/76 hover:bg-white/72 hover:shadow-[0_18px_52px_rgba(114,160,193,0.14)] sm:min-h-[210px] lg:bg-white/44 lg:backdrop-blur-xl"
    >
      <span className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/20 to-[#b9d9eb]/14 opacity-80 transition-opacity duration-200 group-hover/card:opacity-95" />
      <span className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/0 to-transparent transition-all duration-200 group-hover/card:via-[#72a0c1]/55" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#6f9fbe] shadow-[0_8px_22px_rgba(114,160,193,0.12)] backdrop-blur-xl transition-all duration-200 group-hover/card:border-[#72a0c1]/75 group-hover/card:bg-white group-hover/card:text-[#4f86aa]">
              {icon}
            </span>

            <p className="max-w-[150px] font-[var(--font-ui-family)] text-[0.58rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink-soft)]">
              {title}
            </p>
          </div>

          <div className="mt-5 flex items-end gap-2">
            <span className="mb-1.5 text-[0.72rem] text-[var(--color-ink-soft)]">
              {t.common.from}
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

        <span className={smallGlassButtonClass}>
          <ButtonLayers />
          <span className="relative z-10 line-clamp-1">{cta}</span>
          <ArrowRight
            size={13}
            className="relative z-10 shrink-0 text-[#4d88b2] transition-all duration-200 group-hover/card:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
