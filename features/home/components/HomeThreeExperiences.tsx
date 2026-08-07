"use client";

import { Sparkles, Trophy, Handshake, Lightbulb } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const cards = [
  {
    key: "forum",
    number: "01",
    Icon: Lightbulb,
  },
  {
    key: "awards",
    number: "02",
    Icon: Trophy,
  },
  {
    key: "exhibition",
    number: "03",
    Icon: Handshake,
  },
] as const;

export default function HomeThreeExperiences() {
  const { t } = useLanguage();
  const tE = t.home.threeExperiences;

  return (
    <section className="landing-section relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-[360px] w-[min(760px,100%)] -translate-x-1/2 rounded-full bg-[#b9d9eb]/18 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-[#72a0c1]/10 blur-2xl"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="page-eyebrow">{tE.eyebrow}</p>
            <h2 className="mt-4 font-[var(--font-display)] text-[clamp(2.8rem,6vw,5.8rem)] leading-[0.9] tracking-[-0.06em] text-[#111827]">
              {tE.title}
            </h2>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-[1640px] items-stretch gap-5 lg:grid-cols-3">
          {cards.map((card, index) => {
            const item = tE[card.key];
            const Icon = card.Icon;

            return (
              <Reveal key={card.key} delay={index * 0.08}>
                <article className="group relative flex h-full min-h-[540px] overflow-hidden rounded-[34px] border border-white/70 bg-white/62 shadow-[0_18px_54px_rgba(114,160,193,0.11)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_62px_rgba(114,160,193,0.15)]">
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.62)_48%,rgba(185,217,235,0.28)_100%)]" />

                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#b9d9eb]/24 blur-2xl" />

                  <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 shadow-[0_12px_32px_rgba(122,152,175,0.16)] backdrop-blur-xl">
                    <Icon
                      size={21}
                      strokeWidth={1.45}
                      className="text-[#7a98af]"
                    />
                  </div>

                  <div className="relative z-10 flex w-full flex-col p-6 sm:p-7 xl:p-8">
                    <div className="flex items-start justify-between gap-5">
                      <span className="rounded-full border border-[#b9d9eb]/70 bg-white/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a98af] shadow-sm backdrop-blur-xl">
                        {card.number}
                      </span>

                      <Sparkles
                        size={16}
                        strokeWidth={1.4}
                        className="mt-2 text-[#72a0c1]/65"
                      />
                    </div>

                    <div className="mt-10">
                      <h3 className="font-[var(--font-display)] text-[clamp(2rem,2.4vw,3.05rem)] leading-[0.94] tracking-[-0.055em] text-[#111827]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-[1rem] font-light tracking-[-0.03em] text-[#5f6f7c]">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="mt-7 grid gap-3">
                      {item.bullets.map((bullet: string) => (
                        <div
                          key={bullet}
                          className="flex gap-3 text-[0.92rem] leading-6 text-[#27323a]"
                        >
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#72a0c1] shadow-[0_0_0_5px_rgba(185,217,235,0.4)]" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-auto pt-7 font-[var(--font-body)] text-[0.95rem] italic leading-7 text-[#6b7280]">
                      {item.footer}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
