"use client";

import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PRICING } from "@/data/pricing";

export default function GrandPrixCTA() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.participationCta;
  const ps = t.home.pricingSection;

  return (
    <section className="section-rhythm-loose px-[var(--page-gutter)]">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="premium-glass flex flex-col rounded-[36px] p-8 md:p-10">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-hover-accent)]">
            {c.eyebrow}
          </p>
          <h3 className="mt-4 font-[var(--font-display)] text-[clamp(1.9rem,3.2vw,3rem)] leading-[1.06] tracking-[-0.03em] text-[var(--color-ink)]">
            {c.title}
          </h3>
          <p className="mt-5 text-[1rem] leading-[1.85] text-[var(--color-ink-soft)]">
            {c.description}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <Link href="/apply" className="ibpa-button ibpa-button-blue inline-flex items-center gap-2">
              {t.common.applyNow} <ArrowRight size={15} />
            </Link>
            <Link href="/grand-prix" className="ibpa-button ibpa-button-ghost inline-flex items-center gap-2">
              <Trophy size={14} strokeWidth={1.7} />
              {t.home.grandPrixSpotlight.learnMore}
            </Link>
          </div>
        </article>

        <article className="premium-glass rounded-[36px] bg-[linear-gradient(145deg,rgba(185,217,235,0.34),rgba(255,255,255,0.78))] p-8 shadow-[var(--shadow-md)] md:p-10">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-blue)]">
            {c.nominationFees}
          </p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-[var(--color-blue-light)] bg-white/82 px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur-xl">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                {c.members}
              </p>
              <p className="mt-2 font-[var(--font-title-family)] text-[2rem] font-light tracking-[-0.03em] text-[var(--color-ink)]">
                {PRICING.awardParticipation.ibpaMembers.oneNomination}
              </p>
              <p className="mt-1 text-[0.78rem] leading-[1.6] text-[var(--color-ink-soft)]">
                {c.perNomSubmission}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--color-blue-light)] bg-white/82 px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur-xl">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                {ps.nonMembers}
              </p>
              <p className="mt-2 font-[var(--font-title-family)] text-[2rem] font-light tracking-[-0.03em] text-[var(--color-ink)]">
                {PRICING.awardParticipation.nonMembers.oneNomination}
              </p>
              <p className="mt-1 text-[0.78rem] leading-[1.6] text-[var(--color-ink-soft)]">
                {c.perNomSubmission}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--color-blue-light)] bg-white/82 px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur-xl">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                {t.common.grandPrix}
              </p>
              <p className="mt-2 font-[var(--font-title-family)] text-[2rem] font-light tracking-[-0.03em] text-[var(--color-ink)]">
                5+
              </p>
              <p className="mt-1 text-[0.78rem] leading-[1.6] text-[var(--color-ink-soft)]">
                {c.nominationsActivate}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
