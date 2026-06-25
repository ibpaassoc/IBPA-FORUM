"use client";

import { Check } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

export default function GrandPrixRewards() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.rewards;

  return (
    <section className="landing-section-strong relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] bottom-[-16%] h-[380px] w-[380px] rounded-full bg-[#72a0c1]/8 blur-2xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-2xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 font-(--font-display) text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.05em] text-[#1e2430]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-5">
            {c.items.map((item) => (
              <GlassCard
                key={item}
                className="flex items-center gap-4 rounded-[24px] border border-white/65 px-5 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#72a0c1]/25"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/12">
                  <Check className="h-5 w-5" strokeWidth={2} />
                </span>

                <p className="text-[1.02rem] font-medium leading-snug tracking-[-0.02em] text-[#1e2430]">
                  {item}
                </p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
