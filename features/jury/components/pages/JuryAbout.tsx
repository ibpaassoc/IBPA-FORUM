"use client";

import { Award, Scale, ShieldCheck } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

export default function JuryAbout() {
  const { t } = useLanguage();
  const c = t.juryPage.about;

  const items = [
    {
      icon: Award,
      text: c.recognition,
    },
    {
      icon: Scale,
      text: c.objectiveEvaluation,
    },
    {
      icon: ShieldCheck,
      text: c.trust,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#f2f8fb,#ffffff)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-18%] h-80 w-80 rounded-full bg-[#b9d9eb]/40 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-10%] h-96 w-96 rounded-full bg-[#72a0c1]/14 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="flex min-h-[360px] flex-col justify-between rounded-[2rem] border border-white/70 bg-white/58 p-7 shadow-[0_24px_70px_rgba(114,160,193,0.14)] backdrop-blur-2xl md:p-9">
              <div>
                <p className="page-eyebrow">{c.eyebrow}</p>

                <h2 className="mt-4 max-w-xl font-(--font-display) text-[clamp(2.35rem,5vw,4.9rem)] leading-[0.95] tracking-[-0.04em] text-[#10283a]">
                  {c.title}
                </h2>
              </div>

              <p className="mt-8 max-w-xl text-sm leading-7 text-[#4f6f83] md:text-base">
                {c.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.text}
                    className="group relative overflow-hidden rounded-[1.7rem] border border-white/70 bg-white/62 p-6 shadow-[0_18px_54px_rgba(114,160,193,0.12)] backdrop-blur-2xl"
                  >
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/45 to-transparent" />

                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#b9d9eb]/55 bg-white/70 text-[#72a0c1] shadow-[0_12px_32px_rgba(114,160,193,0.14)]">
                        <Icon size={19} strokeWidth={1.7} />
                      </div>

                      <p className="pt-1 text-sm leading-7 text-[#3f6378]">
                        {item.text}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
