"use client";

import { Sparkles, Trophy } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

export default function GrandPrixAbout() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.about;

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14%] top-16 h-[440px] w-[440px] rounded-full bg-[#b9d9eb]/22 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#72a0c1]/12 blur-3xl" />
      </div>

      <div className="page-section relative">
        {/* Block 2 — What is the Grand Prix */}
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="page-eyebrow text-[#72a0c1]">{c.whatEyebrow}</p>

              <h2 className="mt-5 font-(--font-display) text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.05em] text-[#1e2430]">
                {c.whatTitle}
              </h2>
            </div>

            <p className="max-w-2xl text-[1.05rem] leading-8 text-[#5d6877] md:text-[1.12rem]">
              {c.whatText}
            </p>
          </div>
        </Reveal>

        {/* Block 3 — Who qualifies */}
        <Reveal delay={0.14}>
          <GlassCard className="mt-14 overflow-hidden rounded-[34px] border border-[#b9d9eb]/45 px-6 py-8 shadow-[0_24px_60px_rgba(114,160,193,0.12)] sm:px-9 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <p className="page-eyebrow text-[#72a0c1]">{c.whoEyebrow}</p>

                <h3 className="mt-4 font-(--font-display) text-[clamp(1.8rem,3.2vw,2.7rem)] leading-[1.02] tracking-[-0.04em] text-[#1e2430]">
                  {c.whoTitle}
                </h3>
              </div>

              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-[#72a0c1]/25 bg-white/80 px-5 py-3 shadow-[0_12px_30px_rgba(114,160,193,0.12)]">
                  <Trophy className="h-5 w-5 text-[#72a0c1]" strokeWidth={1.7} />
                  <span className="font-(--font-display) text-[clamp(1.35rem,2.4vw,1.9rem)] leading-none tracking-[-0.02em] text-[#1e2430]">
                    {c.whoHighlight}
                  </span>
                </div>

                <p className="mt-5 max-w-xl text-[1.02rem] leading-8 text-[#5d6877]">
                  {c.whoText}
                </p>

                <p className="mt-3 inline-flex items-center gap-2 text-[0.92rem] font-medium text-[#72a0c1]">
                  <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                  {c.whoNote}
                </p>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
