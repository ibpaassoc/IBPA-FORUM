"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

export default function GrandPrixAbout() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.about;

  return (
    <section className="relative min-h-[clamp(640px,78vh,860px)] overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
        <Image
          src="/images/prizes.png"
          alt="IBPA Beauty Awards Grand Prix"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "52% 38%" }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_48%,rgba(255,255,255,0.20)_100%)]" />
        <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.97)_20%,rgba(255,255,255,0.74)_42%,rgba(255,255,255,0.18)_68%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-0 lg:hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.72)_48%,rgba(255,255,255,0.12)_100%)]" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14%] top-12 h-[430px] w-[430px] rounded-full bg-[#b9d9eb]/24 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[22%] h-[360px] w-[360px] rounded-full bg-[#72a0c1]/10 blur-3xl" />
      </div>

      <div className="page-section relative z-10 flex min-h-[clamp(640px,78vh,860px)] items-center py-[clamp(4.5rem,8vw,7rem)]">
        <div className="max-w-[590px]">
          <Reveal>
            <p className="page-eyebrow text-[#72a0c1]">{c.whatEyebrow}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-5 max-w-[10ch] font-[var(--font-title-family)] text-[clamp(3.1rem,7vw,5.8rem)] font-light leading-[0.9] tracking-[-0.045em] text-[#1e2430]">
              {c.whatTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="my-7 flex items-center gap-4">
              <div className="h-px w-14 bg-[#72a0c1]/35" />
              <Sparkles className="h-4 w-4 text-[#72a0c1]/65" strokeWidth={1.7} />
              <div className="h-px w-14 bg-[#72a0c1]/35" />
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <GlassCard
              tone="blue"
              className="max-w-[540px] rounded-[32px] border border-white/65 bg-white/48 px-6 py-6 shadow-[0_24px_70px_rgba(114,160,193,0.13)] backdrop-blur-2xl sm:px-8 sm:py-7"
            >
              <p className="text-[1.04rem] leading-8 text-[#5d6877] md:text-[1.1rem]">
                {c.whatText}
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
