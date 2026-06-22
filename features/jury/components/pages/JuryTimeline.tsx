"use client";

import { CreditCard, FileText, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const STEP_ICONS = [FileText, Search, CreditCard];

export default function JuryTimeline() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: STEP_ICONS[0],
      title: t.juryPage.copy.apply,
      text: t.juryPage.copy.applyText,
    },
    {
      icon: STEP_ICONS[1],
      title: t.juryPage.copy.approved,
      text: t.juryPage.copy.approvedText,
    },
    {
      icon: STEP_ICONS[2],
      title: t.juryPage.copy.registration,
      text: t.juryPage.copy.registrationText,
    },
  ];

  return (
    <section className="section-rhythm-loose bg-white">
      <div className="page-section">
        <Reveal>
          <p className="page-eyebrow mb-[var(--space-sm)]">{t.juryPage.copy.processLabel}</p>
          <h2 className="max-w-xl font-[var(--font-title-family)] text-[clamp(1.9rem,3.5vw,3rem)] font-light leading-[1.06] text-[var(--color-ink)]">
            {t.juryPage.copy.processTitle}
          </h2>
        </Reveal>

        <div className="relative mt-[var(--space-xl)]">
          {/* Connector line */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-11 hidden h-px bg-[var(--color-blue-soft)] md:block"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={index * 0.10}>
                  <article className="group relative flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border-glass)] bg-white p-8 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-blue-soft)] hover:shadow-[var(--shadow-md)]">
                    {/* Icon */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)]">
                      <Icon size={18} strokeWidth={1.6} className="text-[var(--color-blue)]" />
                    </div>

                    <div>
                      <h3 className="font-[var(--font-title-family)] text-[clamp(1.05rem,1.5vw,1.3rem)] font-light leading-[1.12] text-[var(--color-ink)]">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[0.93rem] leading-[1.75] text-[var(--color-ink-soft)]">
                        {step.text}
                      </p>
                    </div>

                    <div className="mt-auto h-0.5 w-8 rounded-full bg-[var(--color-blue-soft)] transition-all duration-300 group-hover:w-12 group-hover:bg-[var(--color-blue)]" />
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
