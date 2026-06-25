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
    <section className="relative overflow-hidden bg-white py-[clamp(4.5rem,9vw,8rem)]">
      <div className="page-section relative">
        <Reveal>
          <div className="max-w-3xl">
            <p className="page-eyebrow mb-[var(--space-sm)]">
              {t.juryPage.copy.processLabel}
            </p>

            <h2 className="font-[var(--font-title-family)] text-[clamp(2.35rem,5vw,5rem)] font-light leading-[0.96] tracking-[-0.045em] text-[var(--color-ink)]">
              {t.juryPage.copy.processTitle}
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-[clamp(2.5rem,5vw,4.5rem)]">
          <div
            aria-hidden
            className="absolute left-[9%] right-[9%] top-[3.15rem] hidden h-px bg-gradient-to-r from-transparent via-[rgba(114,160,193,0.42)] to-transparent lg:block"
          />

          <div className="grid items-stretch gap-5 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <Reveal key={step.title} delay={index * 0.1}>
                  <article className="group relative flex h-full min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_24px_70px_rgba(35,62,82,0.09)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-[rgba(114,160,193,0.42)] hover:bg-white/70 hover:shadow-[0_34px_90px_rgba(35,62,82,0.14)] md:p-8">
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.35)_48%,rgba(185,217,235,0.24)_100%)]"
                    />
                    <div
                      aria-hidden
                      className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[rgba(185,217,235,0.38)] blur-2xl transition-transform duration-700 group-hover:scale-125"
                    />
                    <div
                      aria-hidden
                      className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-[rgba(185,217,235,0.18)] to-transparent"
                    />

                    <div className="relative flex h-full w-full flex-col">
                      <div className="flex h-14 items-start">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_34px_rgba(114,160,193,0.16)] backdrop-blur-xl">
                          <Icon
                            size={20}
                            strokeWidth={1.55}
                            className="text-[var(--color-blue)]"
                          />
                        </div>
                      </div>

                      <div className="mt-auto grid min-h-[13.25rem] grid-rows-[auto_1fr_auto]">
                        <h3 className="max-w-[14rem] font-[var(--font-title-family)] text-[clamp(1.35rem,2vw,1.85rem)] font-light leading-[1.02] tracking-[-0.035em] text-[var(--color-ink)]">
                          {step.title}
                        </h3>

                        <p className="mt-4 max-w-[19rem] text-[0.95rem] leading-[1.75] text-[var(--color-ink-soft)]">
                          {step.text}
                        </p>

                        <div className="mt-8 flex items-center gap-3 self-end">
                          <span className="h-px w-10 bg-[var(--color-blue)] transition-all duration-500 group-hover:w-16" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-blue-soft)]" />
                        </div>
                      </div>
                    </div>
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
