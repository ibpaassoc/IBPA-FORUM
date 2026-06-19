"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PRICING } from "@/data/pricing";

export default function JuryCta() {
  const { t } = useLanguage();
  const c = t.juryPage.juryCta;
  const ps = t.home.pricingSection;

  return (
    <section className="section-rhythm-loose px-[var(--page-gutter)]">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="flex flex-col rounded-[36px] border border-black/8 bg-white p-8 shadow-[0_24px_60px_rgba(3,2,19,0.06)] md:p-10">
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
            <Link
              href="/apply/jury"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-black"
            >
              {t.common.applyAsJury} <ArrowRight size={15} />
            </Link>

            <Link
              href="/jury/login"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              {t.common.juryAccount}
            </Link>
          </div>
        </article>

        <article className="rounded-[36px] border border-[var(--color-blue-light)] bg-[var(--color-blue-wash)] p-8 shadow-[var(--shadow-md)] md:p-10">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-blue)]">
            {c.registrationFee}
          </p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-[var(--color-blue-light)] bg-white px-5 py-5 shadow-[var(--shadow-sm)]">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                {ps.standard}
              </p>
              <p className="mt-2 font-[var(--font-title-family)] text-[2rem] font-light tracking-[-0.03em] text-[var(--color-ink)]">
                {PRICING.judgeRegistration.standard}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--color-blue-light)] bg-white px-5 py-5 shadow-[var(--shadow-sm)]">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                {ps.ibpaMembers}
              </p>
              <p className="mt-2 font-[var(--font-title-family)] text-[2rem] font-light tracking-[-0.03em] text-[var(--color-ink)]">
                {PRICING.judgeRegistration.ibpaMembers}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
