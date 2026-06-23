"use client";

import { Calendar, Sparkles, Star } from "lucide-react";
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
        className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--color-blue-wash)] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-28 bottom-10 h-[22rem] w-[22rem] rounded-full bg-[var(--color-blue-soft)]/25 blur-3xl"
      />

      <div className="page-section relative z-10">
        <Reveal>
          <p className="page-eyebrow">{t.grandPrixPage.copy.timelineEyebrow}</p>
          <h2 className="mt-3 max-w-3xl font-[var(--font-title-family)] text-[clamp(2.4rem,5vw,4.8rem)] font-light leading-[0.95] tracking-[-0.035em] text-[var(--color-ink)]">
            {t.grandPrixPage.copy.timelineTitle}
          </h2>
        </Reveal>

        <div className="mt-[var(--space-xl)] grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Reveal key={step.title} delay={index * 0.1}>
                <article className="group relative min-h-[300px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-7 shadow-[0_24px_80px_rgba(25,39,52,0.09)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/75 hover:shadow-[0_32px_95px_rgba(25,39,52,0.13)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                  <div className="flex items-start justify-between gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_30px_rgba(122,152,175,0.18)] backdrop-blur-md">
                      <Icon size={17} strokeWidth={1.6} className="text-[var(--color-blue)]" />
                    </div>
                  </div>

                  <div className="mt-12">
                    <h3 className="max-w-[12ch] font-[var(--font-title-family)] text-[clamp(1.55rem,2.6vw,2.25rem)] font-light leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)]">
                      {step.title}
                    </h3>

                    <p className="mt-5 max-w-sm text-[0.94rem] leading-[1.75] text-[var(--color-ink-soft)]">
                      {step.text}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-[var(--color-blue-soft)] transition-all duration-500 group-hover:w-full" />
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
