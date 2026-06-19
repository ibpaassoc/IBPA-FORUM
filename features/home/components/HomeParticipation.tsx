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
              className="group relative flex h-full min-h-[480px] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-blue-wash)] text-left lg:min-h-[560px]"
            >
              <Image
                src="/images/events/HomeHero.jpg"
                alt="Forum Tickets"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 700px"
                className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-blue-wash)] via-[var(--color-blue-wash)]/50 to-transparent" />

              <div className="relative flex h-full flex-col justify-between p-[var(--space-lg)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-[var(--radius-sm)] border border-[var(--color-blue)]/30 bg-white/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
                    {p.tickets.mostPopular}
                  </span>
                  {discount ? (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-amber-700">
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
                  <h3 className="mt-2 font-[var(--font-title-family)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.05] text-[var(--color-ink)]">
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
                        className={`text-[clamp(2.4rem,5vw,4rem)] font-medium ${discount ? "text-amber-700" : ""}`}
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
                    <span className="ibpa-button ibpa-button-primary inline-flex">
                      {p.tickets.cta}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </Reveal>

          {/* Award Participation — light card */}
          <Reveal delay={0.1}>
            <Link
              href="/apply"
              className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-white p-[var(--space-lg)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-[var(--space-md)] flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-blue)]/20 bg-[var(--color-blue-wash)]">
                  <Trophy size={18} className="text-[var(--color-blue)]" strokeWidth={1.5} />
                </div>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                  {tierLabel}
                </span>
              </div>

              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)] transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                {p.award.label}
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[0.72rem] text-[var(--color-ink-soft)]">{ps.startingFrom}</span>
                <motion.span
                  key={awardPrice}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="font-[var(--font-title-family)] text-[2.2rem] font-light leading-none text-[var(--color-ink)] transition-colors duration-300 group-hover:text-[var(--color-blue)]"
                >
                  {awardPrice}
                </motion.span>
              </div>

              <p className="mt-3 flex-1 text-[0.87rem] leading-[1.65] text-[var(--color-ink-soft)]">
                {p.award.description}
              </p>

              <div className="mt-[var(--space-lg)]">
                <span className="ibpa-button ibpa-button-primary inline-flex text-[0.72rem]">
                  {p.award.cta}
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Judge Registration — light card */}
          <Reveal delay={0.16}>
            <Link
              href="/jury"
              className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-white p-[var(--space-lg)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:border-[var(--color-blue)]/40 hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-[var(--space-md)] flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-blue)]/20 bg-[var(--color-blue-wash)]">
                  <Star size={18} className="text-[var(--color-blue)]" strokeWidth={1.5} />
                </div>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                  {tierLabel}
                </span>
              </div>

              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)] transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                {p.judge.label}
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[0.72rem] text-[var(--color-ink-soft)]">{ps.startingFrom}</span>
                <motion.span
                  key={judgePrice}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="font-[var(--font-title-family)] text-[2.2rem] font-light leading-none text-[var(--color-ink)] transition-colors duration-300 group-hover:text-[var(--color-blue)]"
                >
                  {judgePrice}
                </motion.span>
              </div>

              <p className="mt-3 flex-1 text-[0.87rem] leading-[1.65] text-[var(--color-ink-soft)]">
                {p.judge.description}
              </p>

              <div className="mt-[var(--space-lg)]">
                <span className="ibpa-button ibpa-button-primary inline-flex text-[0.72rem]">
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
