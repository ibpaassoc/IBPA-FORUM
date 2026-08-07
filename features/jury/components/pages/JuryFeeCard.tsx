"use client";

import { ShieldAlert } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

export default function JuryFeeCard() {
  const { t } = useLanguage();
  const c = t.juryPage.feeCard;

  const tiers = [
    { label: c.standardLabel, price: c.standardPrice },
    { label: c.membersLabel, price: c.membersPrice },
  ];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#f2f8fb,#ffffff)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-14%] top-10 h-[440px] w-[440px] rounded-full bg-[#b9d9eb]/28 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-2xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 font-[var(--font-display)] text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.0] tracking-[-0.045em] text-[#1e2430]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-5">
            {tiers.map((tier) => (
              <GlassCard
                key={tier.label}
                className="overflow-hidden rounded-[30px] border border-white/65 px-7 py-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#72a0c1]/25"
              >
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#72a0c1]">
                  {tier.label}
                </p>

                <p className="mt-4 font-[var(--font-display)] text-[clamp(3rem,6vw,4.5rem)] font-light leading-none tracking-[-0.04em] text-[#1e2430]">
                  {tier.price}
                </p>
              </GlassCard>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-5 flex items-center gap-4 rounded-[26px] border border-[#72a0c1]/22 bg-white/70 px-6 py-5 backdrop-blur-xl">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/12">
              <ShieldAlert className="h-5 w-5" strokeWidth={1.7} />
            </div>

            <p className="text-[0.98rem] font-medium leading-7 text-[#1e2430]">
              {c.note}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
