"use client";

import { Award, BadgeCheck, FileBadge, Sparkles } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const BENEFIT_ICONS = [Award, FileBadge, Sparkles, BadgeCheck, Award];

export default function JuryBenefits() {
  const { t } = useLanguage();
  const b = t.juryPage.benefits;

  return (
    <section className="relative overflow-hidden bg-white py-[clamp(4.5rem,9vw,8rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-18%] top-[-28%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(185,217,235,0.42)_0%,rgba(185,217,235,0.14)_46%,transparent_74%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-24%] right-[-14%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(114,160,193,0.20)_0%,rgba(185,217,235,0.12)_46%,transparent_74%)] blur-3xl"
      />

      <div className="page-section relative">
        <div className="grid gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-[0.9fr_1.25fr] lg:items-center">
          <Reveal>
            <div className="max-w-xl">
              <p className="page-eyebrow">{b.eyebrow}</p>

              <h2 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(2.35rem,5vw,5rem)] font-light leading-[0.96] tracking-[-0.045em] text-[var(--color-ink)]">
                {b.title}
              </h2>

              <p className="mt-6 max-w-md text-[0.98rem] leading-[1.85] text-[var(--color-ink-soft)]">
                {b.description}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(185,217,235,0.30),rgba(255,255,255,0.1),rgba(114,160,193,0.12))] blur-2xl"
              />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_28px_90px_rgba(35,62,82,0.10)] backdrop-blur-2xl">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.42)_52%,rgba(185,217,235,0.22)_100%)]"
                />

                <div className="relative divide-y divide-[rgba(114,160,193,0.16)]">
                  {b.items.map((item, i) => {
                    const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];

                    return (
                      <div
                        key={item}
                        className="group grid gap-4 px-5 py-5 transition-all duration-300 hover:bg-white/45 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-7"
                      >
                        <span className="font-[var(--font-ui-family)] text-[0.7rem] font-black tracking-[0.14em] text-[var(--color-blue)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <p className="text-[0.94rem] leading-[1.7] text-[var(--color-ink)]">
                          {item}
                        </p>

                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(114,160,193,0.14)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/80">
                          <Icon
                            size={17}
                            strokeWidth={1.55}
                            className="text-[var(--color-blue)]"
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
