"use client";

import { Check } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

export default function JuryResponsibilities() {
  const { t } = useLanguage();
  const c = t.juryPage.responsibilities;

  return (
    <section className="landing-section relative overflow-hidden py-20 md:py-28">
      <div className="page-section relative">
        <Reveal>
          <div className="max-w-3xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 font-(--font-display) text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.0] tracking-[-0.045em] text-[#1e2430]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 grid gap-4 md:grid-cols-2 md:gap-5">
            {c.items.map((item) => (
              <GlassCard
                key={item}
                className="flex items-start gap-4 rounded-[24px] border border-white/65 px-5 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#72a0c1]/25"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/12">
                  <Check className="h-4 w-4" strokeWidth={2.2} />
                </span>

                <p className="text-[1rem] leading-7 text-[#1e2430]">{item}</p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
