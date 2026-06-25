"use client";

import { ArrowRight, Calendar, Sparkles, Star, Trophy } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const icons = [Calendar, Star, Sparkles];

export default function GrandPrixTimeline() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: icons[0],
      title: t.grandPrixPage.copy.appWindow,
      text: t.grandPrixPage.copy.appWindowText,
    },
    {
      icon: icons[1],
      title: t.grandPrixPage.copy.scorePeriod,
      text: t.grandPrixPage.copy.scorePeriodText,
    },
    {
      icon: icons[2],
      title: t.grandPrixPage.copy.reveal,
      text: t.grandPrixPage.copy.revealText,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-[var(--space-2xl)]">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[var(--color-blue-wash)] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-28 bottom-10 h-[24rem] w-[24rem] rounded-full bg-[var(--color-blue-soft)]/20 blur-3xl"
      />

      <div className="page-section relative z-10">
        <Reveal>
          <div className="max-w-3xl">
            <p className="page-eyebrow">
              {t.grandPrixPage.copy.timelineEyebrow}
            </p>
          </div>
        </Reveal>

        <div className="relative mt-[var(--space-xl)]">
          <div className="absolute left-8 top-12 bottom-12 hidden w-px bg-gradient-to-b from-transparent via-[var(--color-blue)]/24 to-transparent lg:block" />

          <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:gap-10">
            <Reveal delay={0.08}>
              <div className="sticky top-28 hidden h-fit rounded-[2rem] border border-white/70 bg-white/50 p-6 shadow-[0_24px_80px_rgba(25,39,52,0.08)] backdrop-blur-2xl lg:block">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-blue)]/20 bg-white/70 shadow-[0_14px_34px_rgba(114,160,193,0.16)]">
                  <Trophy
                    size={19}
                    strokeWidth={1.6}
                    className="text-[var(--color-blue)]"
                  />
                </div>

                <p className="mt-8 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                  Start
                </p>

                <p className="mt-2 font-[var(--font-title-family)] text-[3rem] font-light leading-none tracking-[-0.05em] text-[var(--color-ink)]">
                  IBPA
                </p>

                <p className="mt-1 font-[var(--font-title-family)] text-[2.3rem] font-light leading-none tracking-[-0.05em] text-[var(--color-blue)]">
                  2026
                </p>
              </div>
            </Reveal>

            <div className="space-y-5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === steps.length - 1;

                return (
                  <Reveal key={step.title} delay={index * 0.12}>
                    <article className="group relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/52 p-5 shadow-[0_24px_80px_rgba(25,39,52,0.09),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/72 hover:shadow-[0_34px_100px_rgba(25,39,52,0.14)] sm:p-7 lg:p-8">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                      <div className="grid gap-6 lg:grid-cols-[120px_1fr_64px] lg:items-center">
                        <div className="flex items-center gap-4 lg:block">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_30px_rgba(122,152,175,0.18)] backdrop-blur-md">
                            <Icon
                              size={18}
                              strokeWidth={1.6}
                              className="text-[var(--color-blue)]"
                            />
                          </div>

                          <p className="font-[var(--font-title-family)] text-[2.4rem] font-light leading-none tracking-[-0.05em] text-[var(--color-ink)]/20 lg:mt-7 lg:text-[3.5rem]">
                            0{index + 1}
                          </p>
                        </div>

                        <div>
                          <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-blue)]/70">
                            Step {index + 1}
                          </p>

                          <h3 className="max-w-[14ch] font-[var(--font-title-family)] text-[clamp(1.75rem,3.4vw,3rem)] font-light leading-[0.95] tracking-[-0.04em] text-[var(--color-ink)]">
                            {step.title}
                          </h3>

                          <p className="mt-5 max-w-xl text-[0.95rem] leading-[1.75] text-[var(--color-ink-soft)]">
                            {step.text}
                          </p>
                        </div>

                        <div className="hidden lg:flex lg:items-center lg:justify-end">
                          {isLast ? (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-blue)]/20 bg-[var(--color-blue)]/10 text-[var(--color-blue)]">
                              <Trophy size={18} strokeWidth={1.6} />
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-blue)]/18 bg-white/50 text-[var(--color-blue)] transition-transform duration-500 group-hover:translate-x-1">
                              <ArrowRight size={18} strokeWidth={1.6} />
                            </div>
                          )}
                        </div>
                      </div>

                      {!isLast && (
                        <div className="mt-6 hidden items-center gap-3 lg:flex">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-blue)]/24 to-transparent" />
                          <ArrowRight
                            size={15}
                            strokeWidth={1.6}
                            className="text-[var(--color-blue)]/45"
                          />
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-blue)]/24 to-transparent" />
                        </div>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
