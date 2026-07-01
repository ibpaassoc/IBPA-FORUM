"use client";

import type { LucideIcon } from "lucide-react";
import { Award, Layers, ShieldCheck, Star } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

const CARD_ICONS: LucideIcon[] = [Award, ShieldCheck, Layers, Star];

export default function GrandPrixWhySpecial() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.whySpecial;

  return (
    <section id="more-info" className="landing-section-strong relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-16%] top-10 h-[360px] w-[360px] rounded-full bg-[#b9d9eb]/16 blur-2xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-3xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 font-(--font-display) text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.05em] text-[#1e2430]">
              {c.title}
            </h2>

            <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-[#5d6877]">
              {c.lead}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {c.cards.map((card, index) => {
              const Icon = CARD_ICONS[index] ?? Award;

              return (
                <GlassCard
                  key={card.title}
                  className="group relative min-h-[210px] overflow-hidden rounded-[28px] border border-white/65 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#72a0c1]/25"
                >
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/40 to-transparent opacity-70" />

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-[0_10px_24px_rgba(114,160,193,0.13)] ring-1 ring-[#72a0c1]/12">
                    <Icon className="h-5 w-5 text-[#72a0c1]" strokeWidth={1.65} />
                  </div>

                  <h3 className="mt-6 font-(--font-display) text-[1.5rem] leading-tight tracking-[-0.03em] text-[#1e2430]">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-[0.95rem] leading-6 text-[#5d6877]">
                    {card.text}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
