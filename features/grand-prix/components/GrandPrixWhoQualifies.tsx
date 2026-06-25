"use client";

import Image from "next/image";
import { Sparkles, Trophy } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

export default function GrandPrixWhoQualifies() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.about;

  return (
    <section className="landing-photo-section relative min-h-[clamp(640px,78vh,860px)] overflow-hidden bg-white">
      <div className="absolute inset-y-0 left-0 w-full lg:w-[64%]">
        <Image
          src="/images/winners.png"
          alt="Grand Prix qualification"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "48% 22%" }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.16)_100%)]" />
        <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.08)_34%,rgba(255,255,255,0.58)_62%,rgba(255,255,255,0.96)_84%,rgba(255,255,255,1)_100%)]" />
        <div className="absolute inset-0 lg:hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.68)_45%,rgba(255,255,255,0.10)_100%)]" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[16%] top-16 h-[320px] w-[320px] rounded-full bg-[#b9d9eb]/12 blur-2xl" />
      </div>

      <div className="page-section relative z-10 flex min-h-[clamp(640px,78vh,860px)] items-center justify-end py-[clamp(4.5rem,8vw,7rem)]">
        <div className="w-full max-w-[560px] lg:ml-auto">
          <Reveal>
            <p className="page-eyebrow text-[#72a0c1]">{c.whoEyebrow}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-5 max-w-[11ch] font-[var(--font-title-family)] text-[clamp(3rem,6.5vw,5.4rem)] font-light leading-[0.92] tracking-[-0.045em] text-[#1e2430]">
              {c.whoTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <GlassCard
              tone="blue"
              hoverLift
              className="mt-8 overflow-hidden rounded-[34px] border border-white/65 bg-white/54 px-6 py-6 shadow-[0_22px_68px_rgba(114,160,193,0.12)] backdrop-blur-xl sm:px-8 sm:py-7"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-[#72a0c1]/25 bg-white/72 px-5 py-3 shadow-[0_12px_34px_rgba(114,160,193,0.12)]">
                <Trophy className="h-5 w-5 text-[#72a0c1]" strokeWidth={1.7} />
                <span className="font-[var(--font-title-family)] text-[clamp(1.35rem,2.4vw,1.9rem)] font-light leading-none tracking-[-0.02em] text-[#1e2430]">
                  {c.whoHighlight}
                </span>
              </div>

              <p className="mt-6 text-[1.02rem] leading-8 text-[#5d6877]">
                {c.whoText}
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-[#b9d9eb]/35 pt-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1]">
                  <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                </span>

                <p className="text-[0.9rem] font-medium leading-6 text-[#72a0c1]">
                  {c.whoNote}
                </p>
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
