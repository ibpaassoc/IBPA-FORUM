"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, GraduationCap, Sparkles, X } from "lucide-react";
import { createPortal } from "react-dom";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

type MasterClass = {
  name: string;
  photo: string;
  secondaryPhoto?: string;
  role: string;
  topic: string;
  description: string;
  highlights: readonly string[];
  bonus?: string;
};

export default function HomeMasterClasses() {
  const { t } = useLanguage();
  const c = t.home.masterClassesSection;
  const masterClasses = c.masterClasses as readonly MasterClass[];
  const [openClass, setOpenClass] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (openClass === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenClass(null);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openClass]);

  const activeClass = openClass !== null ? masterClasses[openClass] : null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f4f9fc_0%,#ffffff_48%,#f8f8f6_100%)] py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-[#b9d9eb]/24 blur-3xl" />
        <div className="absolute -right-40 bottom-28 h-[28rem] w-[28rem] rounded-full bg-[#72a0c1]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-[var(--landing-divider)]" />
      </div>

      <div className="page-section relative">
        <div className="mx-auto max-w-4xl text-center">
          <p className="page-eyebrow">{c.eyebrow}</p>

          <h2 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(3rem,7vw,6.5rem)] font-light uppercase leading-[0.92] tracking-[0.035em] text-[var(--color-ink)]">
            {c.title}
          </h2>

          <p className="mx-auto mt-[var(--space-md)] max-w-2xl text-[clamp(0.95rem,1.6vw,1.08rem)] leading-[1.8] text-[var(--color-ink-soft)]">
            {c.description}
          </p>
        </div>
      </div>

      <div className="relative mt-[var(--space-xl)] px-[clamp(1rem,3.25vw,4.5rem)]">
        <div className="mx-auto grid max-w-[112rem] gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
          {masterClasses.map((masterClass, index) => (
            <motion.button
              type="button"
              key={masterClass.name}
              aria-haspopup="dialog"
              aria-label={`${c.readMore}: ${masterClass.name}`}
              onClick={() => setOpenClass(index)}
              whileHover={reducedMotion ? undefined : { y: -6 }}
              whileTap={reducedMotion ? undefined : { scale: 0.99 }}
              transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="group relative isolate aspect-[3/4] cursor-pointer overflow-hidden rounded-[30px] border border-[#b9d9eb]/64 bg-[#eaf4f9] text-left shadow-[0_18px_48px_rgba(114,160,193,0.13)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#72a0c1]/55"
            >
              <Image
                src={masterClass.photo}
                alt=""
                aria-hidden="true"
                fill
                quality={45}
                sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1279px) calc((100vw - 6rem) / 2), 25vw"
                className="scale-110 object-cover opacity-40 blur-2xl"
              />
              <Image
                src={masterClass.photo}
                alt={masterClass.name}
                fill
                quality={90}
                sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1279px) calc((100vw - 6rem) / 2), 25vw"
                className="object-contain object-center transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.018]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,42,0.04)_20%,rgba(16,24,42,0.12)_48%,rgba(16,24,42,0.82)_100%)]" />

              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/25 bg-[#10182a]/20 px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
                    {c.formatLabel}
                  </span>
                  <span className="font-[var(--font-accent)] text-[1.1rem] italic tracking-[0.08em] text-white/78">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-3 text-balance font-[var(--font-title-family)] text-[clamp(2rem,3.25vw,3.45rem)] font-light leading-[0.9] tracking-[-0.04em] text-white">
                  {masterClass.name}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-white/80">
                  {masterClass.topic}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
        {activeClass ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-[#10182a]/45 p-0 backdrop-blur-sm sm:p-4 lg:p-6"
            onClick={() => setOpenClass(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={activeClass.name}
              initial={{ opacity: 0, y: 32, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.985 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="relative h-dvh w-full overflow-hidden rounded-none border border-[#b9d9eb]/60 bg-white/94 shadow-2xl backdrop-blur-2xl sm:h-[calc(100dvh-2rem)] sm:rounded-[2.25rem] lg:h-[min(780px,calc(100dvh-3rem))] lg:w-[calc(100vw-3rem)] lg:max-w-[1380px]"
            >
              <button
                type="button"
                aria-label={c.closeLabel}
                onClick={() => setOpenClass(null)}
                className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/85 text-slate-900 shadow-sm backdrop-blur-xl transition hover:border-[#72a0c1]/55 hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="h-full overflow-y-auto overscroll-contain lg:overflow-hidden">
                <div className="grid min-h-full md:h-full md:grid-cols-[minmax(230px,0.68fr)_minmax(0,1.5fr)] lg:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.65fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
                  <div className="relative min-h-[300px] overflow-hidden bg-[#eef5f9] md:h-full md:min-h-0">
                    <Image
                      src={activeClass.photo}
                      alt=""
                      aria-hidden="true"
                      fill
                      quality={45}
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 32vw, 380px"
                      className="scale-110 object-cover opacity-45 blur-2xl"
                    />
                    <Image
                      src={activeClass.photo}
                      alt={activeClass.name}
                      fill
                      quality={90}
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 32vw, 380px"
                      className="object-contain object-center"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(16,24,42,0.72)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7 lg:p-8">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/15 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] backdrop-blur-xl">
                        <GraduationCap className="h-4 w-4" />
                        {c.formatLabel}
                      </div>
                      <h3
                        className={`break-words font-[var(--font-title-family)] font-light leading-none tracking-[-0.035em] ${
                          activeClass.name.length > 22
                            ? "text-[2.1rem] sm:text-4xl lg:text-[2.25rem]"
                            : "text-4xl sm:text-5xl lg:text-[3.4rem]"
                        }`}
                      >
                        {activeClass.name}
                      </h3>
                    </div>
                  </div>

                  <div className="min-w-0 p-6 sm:p-7 md:h-full md:overflow-y-auto lg:p-5 xl:p-8">
                    <div className="lg:grid lg:h-full lg:grid-rows-[auto_auto_auto_1fr_auto]">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#72a0c1]">
                          {c.educatorLabel}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-600 xl:text-sm xl:leading-6">
                          {activeClass.role}
                        </p>
                      </div>

                      <div className="mt-3 xl:mt-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]">
                          {c.topicLabel}
                        </p>
                        <h4 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 xl:text-2xl">
                          {activeClass.topic}
                        </h4>
                      </div>

                      <p className="mt-3 whitespace-pre-line text-xs leading-5 text-slate-600 xl:mt-4 xl:text-sm xl:leading-6">
                        {activeClass.description}
                      </p>

                      <div className="mt-3 rounded-[22px] border border-[#b9d9eb]/55 bg-[#f2f8fb]/80 p-4 xl:mt-5 xl:p-5">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#2f6f9f]">
                        <Sparkles className="h-4 w-4" />
                        {c.programLabel}
                        </div>
                        <ul className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                          {activeClass.highlights.map((highlight) => (
                            <li key={highlight} className="flex gap-2.5 text-xs leading-5 text-slate-600 xl:text-[0.82rem]">
                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#72a0c1]/12 text-[#2f6f9f]">
                                <Check className="h-3 w-3" />
                              </span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {activeClass.bonus ? (
                        <div className="mt-3 rounded-[18px] border border-[#72a0c1]/25 bg-white/78 px-4 py-3 shadow-sm xl:mt-4 xl:px-5 xl:py-4">
                          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#2f6f9f]">
                            {c.bonusLabel}
                          </p>
                          <p className="mt-1.5 text-xs leading-5 text-slate-600 xl:text-[0.82rem]">
                            {activeClass.bonus}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </section>
  );
}
