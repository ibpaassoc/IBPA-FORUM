"use client";

import { Calendar, Sparkles, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SectionHeading } from "@/shared/components/public";

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
    <section className="section-rhythm-loose bg-[var(--surface-tint)]">
      <div className="page-section">
        <SectionHeading
          eyebrow={t.grandPrixPage.copy.timelineEyebrow}
          title={t.grandPrixPage.copy.timelineTitle}
          description={t.grandPrixPage.copy.timelineDescription}
          className="max-w-3xl"
        />

        <div className="relative mt-[var(--space-xl)]">
          <span
            aria-hidden
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[7.1rem] hidden h-px bg-black/10 lg:block"
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="relative rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_18px_40px_rgba(3,2,19,0.05)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex shrink-0 flex-col items-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/12 bg-[var(--surface-tint)] text-[var(--color-ink)]">
                        <Icon size={18} strokeWidth={1.6} />
                      </span>
                      <span className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-soft)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-soft)]">
                        Grand Prix Step
                      </p>
                      <h3 className="mt-3 font-[var(--font-title-family)] text-[clamp(1.1rem,1.6vw,1.4rem)] font-light leading-[1.12] text-[var(--color-ink)]">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[0.94rem] leading-[1.75] text-[var(--color-ink-soft)]">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
