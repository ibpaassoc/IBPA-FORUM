"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Award,
  BookOpenText,
  CalendarDays,
  Clock3,
  FileCheck2,
  SearchCheck,
  Users,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

gsap.registerPlugin(useGSAP);

const questionIcons = [FileCheck2, Award, BookOpenText, SearchCheck] as const;

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
      className="relative isolate overflow-hidden bg-[#10182a] py-[clamp(4.75rem,9vw,8rem)] text-white"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-[8%] -top-[18%] size-[34rem] rounded-full bg-[#72a0c1]/18 blur-3xl" />
        <div className="absolute -bottom-[24%] -left-[12%] size-[30rem] rounded-full bg-[#b9d9eb]/10 blur-3xl" />
        <p className="absolute -right-[0.05em] top-[0.05em] font-[var(--font-title-family)] text-[clamp(8rem,25vw,24rem)] font-light leading-none tracking-[-0.08em] text-white/[0.035]">
          CASE
        </p>
      </div>

      <div className="page-section relative z-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-[clamp(3rem,7vw,7rem)]">
          <div data-consultation-reveal className="relative mx-auto w-full max-w-[31rem] lg:mx-0 lg:sticky lg:top-[calc(var(--site-header-height)+2rem)]">
            <div className="absolute -inset-3 rounded-[2rem] border border-white/12" aria-hidden />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.65rem] border border-white/15 bg-[#173f73] shadow-[0_28px_80px_rgba(0,0,0,0.3)]">
              <Image
                src="/images/founder/iuliia-andreeva-forum.png"
                alt={c.imageAlt}
                fill
                sizes="(max-width: 1023px) min(100vw - 2rem, 31rem), 34vw"
                className="object-cover object-[center_18%]"
              />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,42,0.02)_35%,rgba(16,24,42,0.9)_100%)]" />

              <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#b9d9eb]">
                  {c.portraitLabel}
                </p>
                <p className="mt-2 font-[var(--font-accent-family)] text-[clamp(1.25rem,2.3vw,1.75rem)] italic leading-tight text-white">
                  {c.portraitRole}
                </p>
              </div>
            </div>

            <div className="absolute -right-3 top-7 flex size-20 rotate-6 items-center justify-center rounded-full border border-[#b9d9eb]/45 bg-[#10182a]/88 text-center text-[0.55rem] font-semibold uppercase leading-[1.25] tracking-[0.15em] text-[#d9eef8] shadow-xl backdrop-blur-xl sm:-right-7 sm:size-24">
              <span>{c.caseStamp}</span>
            </div>
          </div>

          <div className="max-w-[54rem]">
            <div data-consultation-reveal className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[#72a0c1] shadow-[0_0_0_6px_rgba(114,160,193,0.18)]" />
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#b9d9eb]">
                {c.eyebrow}
              </p>
            </div>

            <h2
              id="talent-visa-consultation-title"
              data-consultation-reveal
              className="mt-6 text-balance font-[var(--font-title-family)] text-[clamp(3.1rem,7.2vw,6.8rem)] font-light leading-[0.82] tracking-[-0.06em] text-white"
            >
              {c.title}
            </h2>

            <p data-consultation-reveal className="mt-7 max-w-[48rem] text-[clamp(1.03rem,1.6vw,1.25rem)] leading-[1.7] text-white/74">
              {c.intro}
            </p>

            <div data-consultation-reveal className="mt-7 grid gap-4 text-[0.94rem] leading-[1.75] text-white/64 md:grid-cols-2">
              <p>{c.experience}</p>
              <p>{c.proof}</p>
            </div>

            <div data-consultation-reveal className="mt-9 rounded-[1.65rem] border border-white/12 bg-white/[0.055] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <SearchCheck className="size-5 text-[#9fc7df]" aria-hidden />
                <h3 className="font-[var(--font-display)] text-xl tracking-[-0.025em] text-white">
                  {c.questionsTitle}
                </h3>
              </div>

              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {c.questions.map((question, index) => {
                  const Icon = questionIcons[index] ?? FileCheck2;
                  return (
                    <li key={question} className="flex gap-3 rounded-[1.05rem] border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-white/72">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#72a0c1]/16 text-[#b9d9eb]">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span>{question}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div data-consultation-reveal className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.65fr)]">
              <div className="rounded-[1.5rem] border border-[#72a0c1]/35 bg-[linear-gradient(135deg,rgba(23,63,115,0.76),rgba(47,111,159,0.42))] p-5 sm:p-6">
                <div className="flex items-center gap-2.5 text-[#d9eef8]">
                  <CalendarDays className="size-4" aria-hidden />
                  <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.19em]">
                    {c.availabilityTitle}
                  </h3>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {c.dates.map((date) => (
                    <div key={date.dateTime} className="rounded-[1.05rem] border border-white/12 bg-[#10182a]/35 px-4 py-4">
                      <time dateTime={date.dateTime} className="font-[var(--font-display)] text-xl text-white">
                        {date.date}
                      </time>
                      <p className="mt-1.5 text-xs leading-5 text-white/66">{date.time}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-white/60">{c.availabilityNote}</p>
              </div>

              <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/12 bg-white/[0.055] p-5 sm:p-6">
                <div className="flex items-center gap-2.5 text-[#b9d9eb]">
                  <Clock3 className="size-4" aria-hidden />
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.19em]">{c.formatLabel}</p>
                </div>
                <p className="mt-5 font-[var(--font-title-family)] text-[clamp(2rem,4vw,3.3rem)] font-light leading-[0.92] tracking-[-0.04em] text-white">
                  {c.formatValue}
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#b9d9eb]">
                  <Users className="size-4" aria-hidden />
                  {c.participantLabel}
                </div>
              </div>
            </div>

            <p data-consultation-reveal className="mt-8 border-l border-[#72a0c1] pl-5 font-[var(--font-accent-family)] text-[clamp(1rem,1.6vw,1.22rem)] italic leading-[1.6] text-[#d9eef8]">
              {c.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
