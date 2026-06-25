"use client";

import {
  BadgeCheck,
  Calendar,
  CreditCard,
  FileText,
  FolderOpen,
  ImagePlus,
  Sparkles,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

const ICONS = [
  FileText,
  FolderOpen,
  Sparkles,
  ImagePlus,
  CreditCard,
  Calendar,
];

export default function CategoriesInfo() {
  const { t } = useLanguage();
  const c = t.categoriesPage.participation;

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-18%] top-20 h-[440px] w-[440px] rounded-full bg-[#b9d9eb]/25 blur-3xl" />
        <div className="absolute bottom-[-16%] right-[-12%] h-[520px] w-[520px] rounded-full bg-[#72a0c1]/14 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-[980px]">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 max-w-[900px] font-(--font-display) text-[clamp(2.65rem,5.8vw,5.55rem)] leading-[0.93] tracking-[-0.055em] text-[#1e2430]">
              {c.title}
            </h2>

            <p className="mt-7 max-w-[720px] text-[1.02rem] leading-8 text-[#5d6877] md:text-[1.08rem]">
              {c.description}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-14 grid gap-4 md:grid-cols-2 md:gap-5">
            {c.steps.map((step, index) => {
              const Icon = ICONS[index];

              return (
                <GlassCard
                  key={step.number}
                  className="group relative min-h-[116px] overflow-hidden rounded-[32px] border border-white/65 px-5 py-5 transition-all duration-500 hover:-translate-y-1 hover:border-[#72a0c1]/25 sm:px-7 sm:py-6"
                >
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/45 to-transparent opacity-70" />

                  <div className="flex h-full items-center gap-4 pr-11 sm:gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-[0_10px_24px_rgba(114,160,193,0.13)] ring-1 ring-[#72a0c1]/12">
                      <Icon
                        className="h-5 w-5 text-[#72a0c1]"
                        strokeWidth={1.65}
                      />
                    </div>

                    <h3 className="max-w-[440px] text-[1.05rem] font-medium leading-[1.18] tracking-[-0.025em] text-[#1e2430] sm:text-[1.22rem]">
                      {step.title}
                    </h3>
                  </div>

                  <span className="absolute right-6 top-6 font-(--font-display) text-sm font-semibold tracking-[0.22em] text-[#72a0c1]">
                    {step.number}
                  </span>
                </GlassCard>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <GlassCard className="mt-12 rounded-[34px] border border-white/65 px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/10">
                <BadgeCheck className="h-6 w-6" strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="font-(--font-display) text-[1.75rem] leading-none tracking-[-0.04em] text-[#1e2430] sm:text-[2rem]">
                  {c.doneTitle}
                </h3>

                <p className="mt-2 max-w-2xl text-[0.98rem] leading-7 text-[#5d6877]">
                  {c.doneDescription}
                </p>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
