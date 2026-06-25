"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

export default function HomeAwardsInfo() {
  const { t } = useLanguage();
  const c = t.home.awardsInfo;

  return (
    <section className="landing-section relative overflow-hidden py-8 md:py-12">
      <div className="page-section">
        <Reveal>
          <div className="premium-glass relative overflow-hidden rounded-[34px] border border-[#b9d9eb]/45 bg-white/72 p-6 shadow-[0_18px_56px_rgba(114,160,193,0.12)] backdrop-blur-xl md:p-8">
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#b9d9eb]/22 blur-2xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/75 text-[#72a0c1] shadow-[0_10px_24px_rgba(114,160,193,0.14)]">
                <Sparkles size={18} strokeWidth={1.6} />
              </span>

              <div className="relative">
                {/* Small section label */}
                <span className="absolute left-0 top-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#72a0c1]/80">
                  {c.eyebrow}
                </span>

                <div className="pt-5">
                  <h2 className="font-(--font-display) text-[clamp(1.7rem,3vw,2.6rem)] leading-none text-[#111827]">
                    {c.title}
                  </h2>

                  <p className="mt-5 max-w-4xl text-sm leading-7 text-[#4b5563] md:text-base md:leading-8">
                    {c.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
