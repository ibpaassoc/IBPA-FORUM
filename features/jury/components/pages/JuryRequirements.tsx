"use client";

import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const icons = [
  BriefcaseBusiness,
  Award,
  FileCheck2,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
];

export default function JuryRequirements() {
  const { t } = useLanguage();
  const c = t.juryPage.requirements;

  const items = c.items.map((item, index) => ({
    ...item,
    icon: icons[index],
  }));

  return (
    <section
      id="requirements"
      className="landing-section-strong relative overflow-hidden py-20 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-16%] h-72 w-72 rounded-full bg-[#b9d9eb]/18 blur-2xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="mb-10 max-w-4xl md:mb-12">
            <p className="page-eyebrow">{c.label}</p>

            <h2 className="mt-4 max-w-3xl font-(--font-display) text-[clamp(2.35rem,5vw,4.9rem)] leading-[0.95] tracking-[-0.045em] text-[#10283a]">
              {c.title}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.text}
                  className="group relative min-h-[210px] overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/68 p-6 shadow-[0_16px_46px_rgba(114,160,193,0.1)] backdrop-blur-xl transition duration-200 hover:border-[#72a0c1]/45 md:p-7"
                >
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/42 to-transparent" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-[#f7fbfd] text-[#72a0c1] shadow-[0_12px_32px_rgba(114,160,193,0.14)]">
                      <Icon size={20} strokeWidth={1.7} />
                    </div>

                    <span className="rounded-full border border-[#b9d9eb]/45 bg-[#f7fbfd]/80 px-2.5 py-1 text-[0.65rem] font-medium text-[#72a0c1]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-7">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#72a0c1]">
                      {item.label}
                    </p>

                    <p className="mt-3 text-[clamp(1rem,1.45vw,1.13rem)] leading-7 text-[#2d5066]">
                      {item.text}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
