"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

export default function GrandPrixDecision() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.decision;

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="page-section relative">
        <Reveal>
          <div className="max-w-2xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 font-(--font-display) text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.05em] text-[#1e2430]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-5">
          {c.steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08}>
              <article className="group relative flex h-full min-h-[230px] flex-col rounded-[28px] border border-[#b9d9eb]/45 bg-white/70 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#72a0c1]/30 hover:shadow-[0_24px_60px_rgba(114,160,193,0.14)]">
                <span className="font-(--font-display) text-[2.6rem] font-light leading-none text-[#72a0c1]/35 transition-colors duration-500 group-hover:text-[#72a0c1]/60">
                  {step.number}
                </span>

                <h3 className="mt-6 font-(--font-display) text-[1.35rem] leading-tight tracking-[-0.025em] text-[#1e2430]">
                  {step.title}
                </h3>

                <p className="mt-3 text-[0.95rem] leading-6 text-[#5d6877]">
                  {step.text}
                </p>

                <div className="mt-auto h-0.5 w-8 rounded-full bg-[#b9d9eb] transition-all duration-500 group-hover:w-14 group-hover:bg-[#72a0c1]" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
