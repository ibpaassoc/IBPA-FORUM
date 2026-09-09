"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CalendarDays, Check, Clock3 } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

gsap.registerPlugin(useGSAP);

export default function HomeTalentVisaConsultation() {
  const { t } = useLanguage();
  const c = t.home.talentVisaConsultation;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const media = gsap.matchMedia();

      media.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)" },
        ({ conditions }) => {
          const elements = sectionRef.current?.querySelectorAll<HTMLElement>(
            "[data-consultation-reveal]",
          );

          if (!elements?.length) return;

          if (conditions?.reduceMotion) {
            gsap.set(elements, { autoAlpha: 1, y: 0 });
            return;
          }

          gsap.set(elements, { autoAlpha: 0, y: 24 });

          const reveal = () =>
            gsap.to(elements, {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
              stagger: 0.08,
              clearProps: "transform,visibility",
            });
          const safeReveal = contextSafe ? contextSafe(reveal) : reveal;

          if (!("IntersectionObserver" in window)) {
            safeReveal();
            return;
          }

          const observer = new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting) return;
              safeReveal();
              observer.disconnect();
            },
            { threshold: 0.18 },
          );

          if (sectionRef.current) observer.observe(sectionRef.current);
          return () => observer.disconnect();
        },
        sectionRef,
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="talent-visa-consultation"
      ref={sectionRef}
      aria-labelledby="talent-visa-consultation-title"
      className="relative isolate overflow-hidden bg-[linear-gradient(110deg,#f4f9fc_0%,#ffffff_48%,#eef7fb_100%)] py-[clamp(3.75rem,7vw,6rem)] text-[#172033]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-28 -top-40 size-[30rem] rounded-full bg-[#b9d9eb]/35 blur-3xl" />
        <div className="absolute -bottom-48 -left-36 size-[27rem] rounded-full bg-[#dceef7]/60 blur-3xl" />
      </div>

      <div className="page-section relative z-10">
        <div className="rounded-[2rem] border border-[#cfe5f1] bg-white/75 p-5 shadow-[0_24px_70px_rgba(23,63,115,0.08)] backdrop-blur-sm sm:p-7 lg:p-9">
          <div className="grid gap-8 md:grid-cols-[minmax(12rem,0.56fr)_minmax(0,1.44fr)] md:items-center lg:gap-12">
            <div data-consultation-reveal className="relative mx-auto w-full max-w-[18.5rem] md:mx-0 md:max-w-[22rem]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-[#c9e0ec] bg-[#dceef7] shadow-[0_18px_45px_rgba(23,63,115,0.12)]">
                <Image
                  src="/images/founder/iuliia-andreeva-forum.png"
                  alt={c.imageAlt}
                  fill
                  sizes="(max-width: 767px) min(100vw - 3rem, 22rem), 25vw"
                  className="object-cover object-[center_18%]"
                />
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(16,41,69,0.82)_100%)]" />

                <div className="absolute inset-x-5 bottom-5">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#cfe9f6]">
                    {c.portraitLabel}
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-white sm:text-base">
                    {c.portraitRole}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-[47rem]">
              <div data-consultation-reveal className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-[#72a0c1] shadow-[0_0_0_5px_rgba(114,160,193,0.14)]" />
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#4d7ea1]">
                  {c.eyebrow}
                </p>
              </div>

              <h2
                id="talent-visa-consultation-title"
                data-consultation-reveal
                className="mt-5 max-w-[42rem] text-balance font-[var(--font-title-family)] text-[clamp(2.1rem,4vw,3.8rem)] font-light leading-[0.95] tracking-[-0.04em] text-[#172033]"
              >
                {c.title}
              </h2>

              <p data-consultation-reveal className="mt-5 max-w-[44rem] text-[0.98rem] leading-7 text-[#526175] sm:text-base">
                {c.intro}
              </p>

              <div data-consultation-reveal className="mt-6">
                <h3 className="text-sm font-semibold text-[#24496a]">{c.questionsTitle}</h3>
                <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {c.questions.map((question) => (
                    <li key={question} className="flex gap-2.5 text-sm leading-6 text-[#526175]">
                      <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#dceef7] text-[#2f6f9f]">
                        <Check className="size-2.5" strokeWidth={2.5} aria-hidden />
                      </span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div data-consultation-reveal className="mt-7 flex flex-wrap gap-3">
                {c.dates.map((date) => (
                  <div key={date.dateTime} className="min-w-[13rem] flex-1 rounded-2xl border border-[#cfe5f1] bg-[#edf7fb] px-4 py-3.5">
                    <div className="flex items-center gap-2 text-[#2f6f9f]">
                      <CalendarDays className="size-4" aria-hidden />
                      <time dateTime={date.dateTime} className="text-sm font-semibold text-[#24496a]">
                        {date.date}
                      </time>
                    </div>
                    <p className="mt-1.5 pl-6 text-xs leading-5 text-[#66758a]">{date.time}</p>
                  </div>
                ))}

                <div className="flex min-w-[10.5rem] items-center gap-3 rounded-2xl border border-[#cfe5f1] bg-white px-4 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#dceef7] text-[#2f6f9f]">
                    <Clock3 className="size-4" aria-hidden />
                  </span>
                  <p className="text-sm font-semibold text-[#24496a]">{c.formatValue}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
