"use client";

import { CalendarDays, ClipboardCheck, Globe2 } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const icons = [CalendarDays, ClipboardCheck, CalendarDays, ClipboardCheck];

export default function JuryTimeline() {
  const { t } = useLanguage();
  const c = t.juryPage.timeline;

  const steps = c.items.map((item, index) => ({
    ...item,
    icon: icons[index],
  }));

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14%] top-10 h-80 w-80 rounded-full bg-[#b9d9eb]/35 blur-3xl" />
        <div className="absolute bottom-[-16%] right-[-10%] h-96 w-96 rounded-full bg-[#72a0c1]/12 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch">
            <aside className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(242,248,251,0.62))] p-7 shadow-[0_24px_70px_rgba(114,160,193,0.14)] backdrop-blur-2xl md:p-9">
              <div className="absolute right-[-20%] top-[-20%] h-56 w-56 rounded-full bg-[#b9d9eb]/35 blur-3xl" />

              <div className="relative flex h-full flex-col justify-between gap-12">
                <div>
                  <p className="page-eyebrow">{c.eyebrow}</p>

                  <h2 className="mt-4 max-w-md font-(--font-display) text-[clamp(2.45rem,5vw,5rem)] leading-[0.93] tracking-[-0.045em] text-[#10283a]">
                    {c.title}
                  </h2>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-[1.6rem] border border-[#b9d9eb]/45 bg-white/70 p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#72a0c1]">
                      {c.yearLabel}
                    </p>
                    <p className="mt-2 font-(--font-display) text-5xl leading-none tracking-[-0.04em] text-[#10283a]">
                      {c.year}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-[1.6rem] border border-[#b9d9eb]/45 bg-white/70 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-[#f7fbfd] text-[#72a0c1]">
                      <Globe2 size={19} strokeWidth={1.7} />
                    </div>

                    <div>
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#72a0c1]">
                        {c.formatLabel}
                      </p>
                      <p className="mt-1 font-(--font-display) text-2xl leading-none text-[#10283a]">
                        {c.formatValue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="rounded-[2.2rem] border border-white/70 bg-white/58 p-4 shadow-[0_24px_70px_rgba(114,160,193,0.12)] backdrop-blur-2xl md:p-5">
              <div className="grid gap-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <article
                      key={step.label}
                      className="group relative overflow-hidden rounded-[1.7rem] border border-[#b9d9eb]/38 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(247,251,253,0.72))] p-5 transition duration-500 hover:border-[#72a0c1]/45 md:p-6"
                    >
                      <div className="absolute inset-y-5 left-[2.15rem] w-px bg-[#b9d9eb]/45" />

                      <div className="relative grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-[#72a0c1] shadow-[0_12px_32px_rgba(114,160,193,0.14)]">
                          <Icon size={18} strokeWidth={1.7} />
                        </div>

                        <div>

                          <h3 className="mt-2 font-(--font-display) text-[clamp(1.45rem,2.4vw,2rem)] leading-[1.02] tracking-[-0.03em] text-[#10283a]">
                            {step.title}
                          </h3>
                        </div>

                        <div className="rounded-[1.25rem] border border-[#b9d9eb]/45 bg-[#f7fbfd]/78 px-4 py-3 sm:min-w-[230px]">
                          <p className="font-(--font-display) text-[clamp(1.2rem,2vw,1.55rem)] leading-tight tracking-[-0.02em] text-[#10283a]">
                            {step.date}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
