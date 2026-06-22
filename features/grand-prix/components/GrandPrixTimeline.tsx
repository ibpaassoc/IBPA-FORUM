"use client";

import Image from "next/image";
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
    <section className="relative overflow-hidden" style={{ background: "var(--surface-blue-tint)" }}>
      {/* Full-bleed editorial image strip */}
      <div className="relative h-[40vw] max-h-[420px] w-full overflow-hidden">
        <Image
          src="/images/editorial/items.jpg"
          alt="Grand Prix timeline"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.50)_100%)]" />

        {/* Eyebrow + title overlaid on image */}
        <div className="page-section absolute inset-0 flex flex-col justify-end pb-10">
          <p className="page-eyebrow text-white/70">{t.grandPrixPage.copy.timelineEyebrow}</p>
          <h2 className="mt-2 max-w-2xl font-[var(--font-title-family)] text-[clamp(2rem,4vw,3.4rem)] font-light leading-[1.04] text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.35)]">
            {t.grandPrixPage.copy.timelineTitle}
          </h2>
        </div>
      </div>

      {/* Timeline steps */}
      <div className="page-section py-[var(--space-xl)]">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={index * 0.10}>
                <article className="premium-glass rounded-[var(--radius-lg)] p-7 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)]">
                    <Icon size={16} strokeWidth={1.6} className="text-[var(--color-blue)]" />
                  </div>

                  <h3 className="mt-5 font-[var(--font-title-family)] text-[clamp(1.05rem,1.4vw,1.3rem)] font-light leading-[1.12] text-[var(--color-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[0.92rem] leading-[1.75] text-[var(--color-ink-soft)]">
                    {step.text}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        {t.grandPrixPage.copy.timelineDescription ? (
          <Reveal delay={0.30}>
            <p className="mt-8 max-w-2xl text-center text-[0.94rem] leading-[1.78] text-[var(--color-ink-soft)] md:mx-auto">
              {t.grandPrixPage.copy.timelineDescription}
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
