"use client";

import {
  Calendar,
  Sparkles,
  Star,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SectionHeading, StaggerContainer } from "@/shared/components/public";

const icons = [Calendar, Star, Sparkles];

export default function GrandPrixTimeline() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Calendar,
      title: t.grandPrixPage.copy.appWindow,
      text: t.grandPrixPage.copy.appWindowText,
    },
    {
      icon: Star,
      title: t.grandPrixPage.copy.scorePeriod,
      text: t.grandPrixPage.copy.scorePeriodText,
    },
    {
      icon: Sparkles,
      title: t.grandPrixPage.copy.reveal,
      text: t.grandPrixPage.copy.revealText,
    },
  ];

  return (
    <section className="section-rhythm-tight bg-[var(--color-ink)]">
      <div className="page-section">
        <SectionHeading
          eyebrow={t.grandPrixPage.copy.timelineEyebrow}
          title={t.grandPrixPage.copy.timelineTitle}
          className="[&_p.page-eyebrow]:text-[var(--color-hover-accent)] [&_p.page-eyebrow]:[&::before]:bg-[var(--color-hover-accent)] [&_h2]:text-white"
        />

        <StaggerContainer
          className="mt-[var(--space-xl)] grid gap-px overflow-hidden rounded-[var(--radius)] border border-white/10 bg-white/8 md:grid-cols-3"
          stagger={0.1}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="group relative flex flex-col bg-[var(--color-ink)] p-[var(--space-lg)] transition-colors duration-300 hover:bg-white/4"
              >
                {/* Step number */}
                <p className="mb-[var(--space-md)] select-none font-[var(--font-ui-family)] text-[4rem] font-black leading-[1] tracking-[-0.06em] text-white/5">
                  {String(index + 1).padStart(2, "0")}
                </p>

                {/* Icon */}
                <div className="mb-[var(--space-sm)] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6">
                  <Icon size={18} strokeWidth={1.5} className="text-[var(--color-hover-accent)]" />
                </div>

                {/* Title */}
                <h3 className="font-[var(--font-ui-family)] text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-hover-accent)]">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-[0.92rem] leading-[1.72] text-white/55">
                  {step.text}
                </p>

                {/* Connecting line (desktop) */}
                {index < steps.length - 1 ? (
                  <span className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 h-px w-[1px] md:block" aria-hidden />
                ) : null}
              </article>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
