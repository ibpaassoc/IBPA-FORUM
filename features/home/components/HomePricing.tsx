"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal, StaggerContainer } from "@/shared/components/public";
import { PRICING } from "@/data/pricing";
import { Ticket, Trophy, Star } from "lucide-react";

function PricingRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border-soft)] last:border-0">
      <span className={`text-[0.9rem] ${muted ? "text-[var(--color-ink-soft)]" : "text-[var(--color-ink)]"}`}>
        {label}
      </span>
      <span className="font-[var(--font-title-family)] text-[1.15rem] font-medium text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  );
}

export default function HomePricing() {
  const { t } = useLanguage();
  const ps = t.home.pricingSection;

  return (
    <section className="section-rhythm-loose bg-[var(--surface-tint)]">
      <div className="page-section">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap mb-[var(--space-xl)]">
            <div>
              <p className="page-eyebrow mb-[var(--space-sm)]">{ps.eyebrow}</p>
              <h2 className="font-[var(--font-title-family)] text-[clamp(1.9rem,3.5vw,3rem)] font-light leading-[1.1] text-[var(--color-ink)]">
                {ps.title}
              </h2>
            </div>
          </div>
        </Reveal>

        <StaggerContainer className="grid gap-6 md:grid-cols-3" stagger={0.08}>

          {/* ── Forum Tickets ── */}
          <article className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] overflow-hidden">
            <div className="border-b border-[var(--border-default)] bg-[var(--color-ink)] p-[var(--space-md)]">
              <div className="flex items-center gap-2 mb-3">
                <Ticket size={16} className="text-[var(--color-blue-soft)]" strokeWidth={1.5} />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue-soft)]">
                  {ps.forumTickets}
                </span>
              </div>
              <p className="font-[var(--font-title-family)] text-[clamp(1.5rem,2.5vw,2rem)] font-light text-white leading-tight">
                {PRICING.forumTickets.startingFrom}
                <span className="ml-1 text-[0.8rem] font-normal text-white/50">/ person</span>
              </p>
            </div>

            <div className="flex-1 p-[var(--space-md)]">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-hover-accent)]">
                {ps.ibpaMembers}
              </p>
              <PricingRow label={ps.oneDayPass} value={PRICING.forumTickets.ibpaMembers.oneDay} />
              <PricingRow label={ps.twoDayPass} value={PRICING.forumTickets.ibpaMembers.twoDays} />
              <PricingRow label={ps.galaDinner} value={PRICING.forumTickets.ibpaMembers.galaDinner} />

              <p className="mt-4 mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-soft)]">
                {ps.standard}
              </p>
              <PricingRow label={ps.oneDayPass} value={PRICING.forumTickets.standard.oneDay} muted />
              <PricingRow label={ps.twoDayPass} value={PRICING.forumTickets.standard.twoDays} muted />
              <PricingRow label={ps.galaDinner} value={PRICING.forumTickets.standard.galaDinner} muted />
            </div>

            <div className="p-[var(--space-md)] pt-0">
              <Link href="/tickets" className="ibpa-button ibpa-button-primary w-full text-center">
                Buy Tickets
              </Link>
            </div>
          </article>

          {/* ── Award Participation ── */}
          <article className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] overflow-hidden">
            <div className="border-b border-[var(--border-default)] bg-[var(--surface-strong)] p-[var(--space-md)]">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-hover-accent)]">
                  {ps.awardParticipation}
                </span>
              </div>
              <p className="font-[var(--font-title-family)] text-[clamp(1.5rem,2.5vw,2rem)] font-light text-[var(--color-ink)] leading-tight">
                {PRICING.awardParticipation.startingFrom}
                <span className="ml-1 text-[0.8rem] font-normal text-[var(--color-ink-soft)]">/ nomination</span>
              </p>
            </div>

            <div className="flex-1 p-[var(--space-md)]">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-hover-accent)]">
                {ps.ibpaMembers}
              </p>
              <PricingRow label={ps.oneNomination} value={PRICING.awardParticipation.ibpaMembers.oneNomination} />
              <PricingRow label={ps.threeNominations} value={PRICING.awardParticipation.ibpaMembers.threeNominations} />
              <PricingRow label={ps.fiveNominations} value={PRICING.awardParticipation.ibpaMembers.fiveNominations} />

              <p className="mt-4 mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-soft)]">
                {ps.nonMembers}
              </p>
              <PricingRow label={ps.oneNomination} value={PRICING.awardParticipation.nonMembers.oneNomination} muted />
              <PricingRow label={ps.threeNominations} value={PRICING.awardParticipation.nonMembers.threeNominations} muted />
              <PricingRow label={ps.fiveNominations} value={PRICING.awardParticipation.nonMembers.fiveNominations} muted />

              <p className="mt-4 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2 text-[0.72rem] italic text-[var(--color-hover-accent)]">
                {ps.grandPrixNote}
              </p>
            </div>

            <div className="p-[var(--space-md)] pt-0">
              <Link href="/apply" className="ibpa-button ibpa-button-gold w-full text-center">
                Apply Now
              </Link>
            </div>
          </article>

          {/* ── Judge Registration ── */}
          <article className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] overflow-hidden">
            <div className="border-b border-[var(--border-default)] bg-[var(--surface-strong)] p-[var(--space-md)]">
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-hover-accent)]">
                  {ps.judgeRegistration}
                </span>
              </div>
              <p className="font-[var(--font-title-family)] text-[clamp(1.5rem,2.5vw,2rem)] font-light text-[var(--color-ink)] leading-tight">
                {PRICING.judgeRegistration.startingFrom}
                <span className="ml-1 text-[0.8rem] font-normal text-[var(--color-ink-soft)]">/ judge</span>
              </p>
            </div>

            <div className="flex-1 p-[var(--space-md)]">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-hover-accent)]">
                {ps.ibpaMembers}
              </p>
              <PricingRow label={ps.ibpaMembers} value={PRICING.judgeRegistration.ibpaMembers} />

              <p className="mt-4 mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-soft)]">
                {ps.standard}
              </p>
              <PricingRow label={ps.standard} value={PRICING.judgeRegistration.standard} muted />

              <p className="mt-4 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2 text-[0.72rem] italic text-[var(--color-ink-soft)]">
                {ps.judgePaidAfterApproval}
              </p>
            </div>

            <div className="p-[var(--space-md)] pt-0">
              <Link href="/jury" className="ibpa-button ibpa-button-ghost w-full text-center">
                Register as Judge
              </Link>
            </div>
          </article>

        </StaggerContainer>
      </div>
    </section>
  );
}
