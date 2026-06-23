"use client";

import { Award, Medal, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const STEP_ICONS = [Medal, Trophy, Award];
const ACCENT_COLORS = [
  "var(--color-blue)",
  "var(--color-blue-soft)",
  "var(--color-hover-accent)",
];

export default function GrandPrixFlow() {
  const { t } = useLanguage();
  const steps = t.grandPrixPage.flow.steps;

  return (
    <section id="flow" className="section-rhythm-loose bg-white">
      <div className="page-section">
        <Reveal>
          <p className="page-eyebrow mb-[var(--space-sm)]">{t.grandPrixPage.flow.label}</p>
          <h2 className="max-w-xl font-[var(--font-title-family)] text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.06] text-[var(--color-ink)]">
            {t.grandPrixPage.flow.title}
          </h2>
        </Reveal>

        <div className="relative mt-[var(--space-xl)] grid gap-6 md:grid-cols-3">
          {/* Connector line — desktop */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-11 hidden h-px bg-[var(--color-blue-soft)] md:block"
          />

          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index % STEP_ICONS.length];
            return (
              <Reveal key={step.title} delay={index * 0.10}>
                <article className="group relative flex flex-col items-start gap-5 rounded-[var(--radius-lg)] border border-[var(--border-glass)] bg-white p-8 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-blue-soft)] hover:shadow-[var(--shadow-md)]">
                  {/* Icon circle */}
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)]"
                  >
                    <Icon size={18} strokeWidth={1.6} className="text-[var(--color-blue)]" />
                  </div>

                  <div>
                    <h3 className="font-[var(--font-title-family)] text-[clamp(1.1rem,1.5vw,1.35rem)] font-light leading-[1.12] text-[var(--color-ink)]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[0.93rem] leading-[1.75] text-[var(--color-ink-soft)]">
                      {step.text}
                    </p>
                  </div>

                  {/* Bottom accent bar */}
                  <div className="mt-auto h-0.5 w-8 rounded-full bg-[var(--color-blue-soft)] transition-all duration-300 group-hover:w-14 group-hover:bg-[var(--color-blue)]" />
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
