"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

gsap.registerPlugin(useGSAP);

export default function HomeFounder() {
  const { t } = useLanguage();
  const founder = t.home.founder;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)" },
        ({ conditions }) => {
          if (conditions?.reduceMotion) {
            gsap.set("[data-founder-reveal]", { autoAlpha: 1, y: 0, x: 0 });
            return;
          }

          const timeline = gsap.timeline({
            defaults: { duration: 0.72, ease: "power3.out" },
          });

          timeline
            .from("[data-founder-kicker]", { autoAlpha: 0, y: 12, duration: 0.45 })
            .from("[data-founder-masthead]", { autoAlpha: 0, x: 24, duration: 0.8 }, "<0.08")
            .from("[data-founder-portrait]", { autoAlpha: 0, y: 24, scale: 0.97 }, "<0.08")
            .from("[data-founder-copy]", { autoAlpha: 0, y: 18, stagger: 0.07 }, "<0.1")
            .from("[data-founder-journey]", { autoAlpha: 0, y: 20 }, "<0.12");

          return () => timeline.kill();
        },
        sectionRef,
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="founder"
      ref={sectionRef}
      aria-labelledby="founder-heading"
      className="landing-section relative overflow-hidden bg-[linear-gradient(160deg,rgba(242,248,251,0.82)_0%,rgba(255,255,255,0.86)_54%,rgba(232,244,250,0.82)_100%)] py-[clamp(4.5rem,9vw,8rem)]"
    >
      <div data-founder-reveal data-founder-masthead aria-hidden className="pointer-events-none absolute left-1/2 top-[clamp(3rem,8vw,6rem)] w-max -translate-x-1/2 whitespace-nowrap text-center font-[var(--font-title-family)] text-[clamp(9rem,27vw,28rem)] leading-[0.72] tracking-[-0.09em] text-[var(--color-blue)]/[0.14]">
        {founder.masthead}
      </div>
      <div aria-hidden className="pointer-events-none absolute bottom-[12%] left-[-10rem] size-[24rem] rounded-full bg-[var(--color-blue-soft)]/30 blur-3xl" />

      <div className="page-section relative z-10">
        <div data-founder-kicker className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-[var(--color-blue)] shadow-[0_0_0_6px_rgba(185,217,235,0.42)]" />
          <p className="premium-label">{founder.eyebrow}</p>
          <span aria-hidden className="h-px w-10 bg-[var(--color-blue)]/45" />
        </div>

        <div className="relative mt-[clamp(2.25rem,5vw,4rem)] grid gap-12 lg:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-[clamp(3rem,7vw,7rem)]">
          <div data-founder-reveal data-founder-portrait className="relative mx-auto w-full max-w-[31rem] lg:mx-0 lg:pt-10">
            <div aria-hidden className="absolute -inset-3 rounded-[2.1rem] border border-[var(--color-blue-soft)]/80 bg-white/25" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/60 shadow-[0_26px_70px_rgba(67,106,132,0.18)]">
              <Image
                src="/images/founder/iuliia-andreeva.jpg"
                alt={founder.imageAlt}
                fill
                sizes="(max-width: 1023px) min(100vw - 2rem, 31rem), 34vw"
                className="object-cover object-[center_18%] transition duration-700 ease-[var(--motion-editorial)] hover:scale-[1.02]"
              />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,2,19,0.02)_35%,rgba(3,2,19,0.54)_100%)]" />

              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white sm:inset-x-7 sm:bottom-7">
                <div>
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/72">{founder.cardLabel}</p>
                  <p className="mt-2 font-[var(--font-accent-family)] text-[clamp(1.3rem,2.4vw,1.8rem)] italic leading-none">{founder.cardRole}</p>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/16 font-[var(--font-title-family)] text-sm backdrop-blur-md">{founder.initials}</span>
              </div>
            </div>

            <div className="absolute -right-4 top-[22%] hidden min-h-40 items-center justify-center rounded-full border border-[var(--color-blue-soft)] bg-white/80 px-2.5 py-4 shadow-[0_16px_34px_rgba(114,160,193,0.12)] backdrop-blur-md lg:flex">
              <span className="[writing-mode:vertical-rl] rotate-180 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">{founder.railLabel}</span>
            </div>
          </div>

          <div className="relative max-w-[52rem] lg:pt-2">
            <p data-founder-copy data-founder-reveal className="font-[var(--font-accent-family)] text-[clamp(0.98rem,1.4vw,1.16rem)] italic tracking-[0.03em] text-[var(--color-hover-accent)]">{founder.role}</p>

            <h2 id="founder-heading" data-founder-copy data-founder-reveal className="mt-5 font-[var(--font-title-family)] text-[clamp(3.5rem,8.2vw,7rem)] font-light leading-[0.78] tracking-[-0.065em] text-[var(--color-ink)]">
              {founder.nameLines.map((line) => <span key={line} className="block">{line}</span>)}
            </h2>

            <p data-founder-copy data-founder-reveal className="mt-7 max-w-[44rem] text-[clamp(1.05rem,1.8vw,1.34rem)] leading-[1.6] text-[var(--color-ink-soft)]">{founder.lede}</p>

            <div data-founder-copy data-founder-reveal aria-hidden className="mt-7 h-px w-20 bg-[var(--color-blue)]" />

            <div className="mt-6 grid gap-5 text-[0.96rem] leading-[1.78] text-[var(--color-ink-soft)] md:text-[1rem]">
              {founder.paragraphs.map((paragraph) => <p key={paragraph} data-founder-copy data-founder-reveal>{paragraph}</p>)}
            </div>

            <div data-founder-copy data-founder-reveal className="relative mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--color-blue-soft)]/80 bg-white/72 px-5 py-5 shadow-[0_14px_38px_rgba(114,160,193,0.1)] backdrop-blur-xl sm:px-6">
              <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-[var(--color-blue)]" />
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-hover-accent)]">{founder.missionTitle}</p>
              <p className="mt-2 max-w-3xl text-[0.96rem] leading-[1.72] text-[var(--color-ink-soft)]">{founder.missionText}</p>
            </div>
          </div>
        </div>

        <div data-founder-reveal data-founder-journey className="relative mt-14 overflow-hidden rounded-[1.75rem] border border-[var(--color-blue-soft)]/80 bg-white/76 p-5 shadow-[0_18px_54px_rgba(114,160,193,0.1)] backdrop-blur-xl sm:p-7 lg:mt-20 lg:p-8">
          <div className="flex flex-col gap-3 border-b border-[var(--color-blue-soft)]/65 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-hover-accent)]">{founder.journeyEyebrow}</p>
            <p className="font-[var(--font-accent-family)] text-sm italic tracking-[0.03em] text-[var(--color-ink-soft)]">{founder.journeyMeta}</p>
          </div>

          <ol className="relative grid gap-7 pt-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div aria-hidden className="absolute left-[calc(12.5%)] right-[calc(12.5%)] top-[3.05rem] hidden h-px bg-[var(--color-blue-soft)] lg:block" />
            {founder.journey.map((step, index) => (
              <li key={step.title} data-founder-reveal className="relative">
                <div className="relative z-10 flex size-9 items-center justify-center rounded-full border border-[var(--color-blue)]/55 bg-white font-[var(--font-title-family)] text-[0.8rem] text-[var(--color-hover-accent)] shadow-[0_0_0_5px_rgba(242,248,251,0.92)]">{String(index + 1).padStart(2, "0")}</div>
                <h3 className="mt-5 font-[var(--font-title-family)] text-[clamp(1.2rem,1.8vw,1.55rem)] leading-[1.05] text-[var(--color-ink)]">{step.title}</h3>
                <p className="mt-2 max-w-[15rem] text-sm leading-[1.6] text-[var(--color-ink-soft)]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
