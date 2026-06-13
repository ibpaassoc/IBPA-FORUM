"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";
import { PRICING } from "@/data/pricing";
import { Ticket, Trophy, Star } from "lucide-react";

type Tier = "ibpa" | "standard";

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 py-3 last:border-0">
      <span className="text-[0.88rem] text-white/55">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="font-[var(--font-title-family)] text-[1.1rem] font-medium text-white"
      >
        {value}
      </motion.span>
    </div>
  );
}

export default function HomePricing({ tier }: { tier: Tier }) {
  const { t } = useLanguage();
  const ps = t.home.pricingSection;

  const forumRows =
    tier === "ibpa"
      ? [
          { label: ps.oneDayPass, value: PRICING.forumTickets.ibpaMembers.oneDay },
          { label: ps.twoDayPass, value: PRICING.forumTickets.ibpaMembers.twoDays },
          { label: ps.galaDinner, value: PRICING.forumTickets.ibpaMembers.galaDinner },
        ]
      : [
          { label: ps.oneDayPass, value: PRICING.forumTickets.standard.oneDay },
          { label: ps.twoDayPass, value: PRICING.forumTickets.standard.twoDays },
          { label: ps.galaDinner, value: PRICING.forumTickets.standard.galaDinner },
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

  const forumStarting =
    tier === "ibpa"
      ? PRICING.forumTickets.ibpaMembers.oneDay
      : PRICING.forumTickets.standard.oneDay;

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

        <div className="grid gap-4 md:grid-cols-3">

          {/* ── Forum Tickets ── */}
          <Reveal delay={0.05}>
            <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-ink)]">
              {/* Card header */}
              <div className="border-b border-white/8 p-[var(--space-md)]">
                <div className="mb-3 flex items-center gap-2">
                  <Ticket size={14} className="text-white/35" strokeWidth={1.5} />
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/40 transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                    {ps.forumTickets}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.72rem] text-white/35">From</span>
                  <motion.span
                    key={forumStarting}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-white"
                  >
                    {forumStarting}
                  </motion.span>
                  <span className="text-[0.72rem] text-white/30">/ person</span>
                </div>
              </div>

              {/* Rows */}
              <div className="flex-1 px-[var(--space-md)] pt-[var(--space-sm)]">
                {forumRows.map((row) => (
                  <PriceRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>

              <div className="p-[var(--space-md)]">
                <Link href="/tickets" className="ibpa-button ibpa-button-white w-full text-center">
                  Buy Tickets
                </Link>
              </div>
            </article>
          </Reveal>

          {/* ── Award Participation ── */}
          <Reveal delay={0.1}>
            <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-ink)]">
              <div className="border-b border-white/8 p-[var(--space-md)]">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy size={14} className="text-white/35" strokeWidth={1.5} />
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/40 transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                    {ps.awardParticipation}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.72rem] text-white/35">From</span>
                  <motion.span
                    key={awardStarting}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-white"
                  >
                    {awardStarting}
                  </motion.span>
                  <span className="text-[0.72rem] text-white/30">/ nom.</span>
                </div>
              </div>

              <div className="flex-1 px-[var(--space-md)] pt-[var(--space-sm)]">
                {awardRows.map((row) => (
                  <PriceRow key={row.label} label={row.label} value={row.value} />
                ))}
                <p className="mt-3 rounded-[var(--radius-sm)] bg-white/5 px-3 py-2 text-[0.69rem] italic text-white/35">
                  {ps.grandPrixNote}
                </p>
              </div>

              <div className="p-[var(--space-md)]">
                <Link href="/apply" className="ibpa-button ibpa-button-white w-full text-center">
                  Apply Now
                </Link>
              </div>
            </article>
          </Reveal>

          {/* ── Judge Registration ── */}
          <Reveal delay={0.15}>
            <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-ink)]">
              <div className="border-b border-white/8 p-[var(--space-md)]">
                <div className="mb-3 flex items-center gap-2">
                  <Star size={14} className="text-white/35" strokeWidth={1.5} />
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/40 transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                    {ps.judgeRegistration}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.72rem] text-white/35">Fee</span>
                  <motion.span
                    key={judgePrice}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-white"
                  >
                    {judgePrice}
                  </motion.span>
                  <span className="text-[0.72rem] text-white/30">/ judge</span>
                </div>
              </div>

              <div className="flex-1 px-[var(--space-md)] pt-[var(--space-sm)]">
                <PriceRow
                  label={tier === "ibpa" ? ps.ibpaMembers : ps.standard}
                  value={judgePrice}
                />
                <p className="mt-3 rounded-[var(--radius-sm)] bg-white/5 px-3 py-2 text-[0.69rem] italic text-white/35">
                  {ps.judgePaidAfterApproval}
                </p>
              </div>

              <div className="p-[var(--space-md)]">
                <Link href="/jury" className="ibpa-button ibpa-button-white w-full text-center">
                  Register as Judge
                </Link>
              </div>
            </article>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
