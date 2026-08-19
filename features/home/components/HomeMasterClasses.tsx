"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, GraduationCap, Sparkles, X } from "lucide-react";
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
  const [activePreview, setActivePreview] = useState(0);

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

        <div className="mt-[var(--space-xl)] -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {masterClasses.map((masterClass, index) => {
            const isActive = activePreview === index;

            return (
              <article
                key={masterClass.name}
                onMouseEnter={() => setActivePreview(index)}
                onFocus={() => setActivePreview(index)}
                className={`group relative h-[31rem] shrink-0 snap-center overflow-hidden rounded-[30px] border bg-white/74 shadow-[0_20px_58px_rgba(114,160,193,0.12)] backdrop-blur-xl transition-[flex-grow,width,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-[#9fc7df]/70 hover:shadow-[0_24px_68px_rgba(114,160,193,0.17)] sm:h-[33rem] md:h-[30rem] md:min-w-0 md:snap-none motion-reduce:transition-none ${
                  isActive
                    ? "w-[min(82vw,25rem)] border-[#9fc7df]/70 md:flex-[3.2]"
                    : "w-[12rem] border-[#b9d9eb]/45 md:flex-[0.78]"
                }`}
              >
                <div
                  className="absolute inset-0 overflow-hidden bg-[#eef5f9]"
                >
                  <Image
                    src={masterClass.photo}
                    alt={masterClass.name}
                    fill
                    sizes="(max-width: 767px) 82vw, (min-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.025]"
                  />
                  <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "bg-[linear-gradient(90deg,rgba(16,24,42,0.14)_0%,rgba(16,24,42,0.62)_100%)]" : "bg-[linear-gradient(180deg,transparent_36%,rgba(16,24,42,0.72)_100%)]"}`} />
                </div>

                <div
                  className={`absolute inset-x-0 bottom-0 flex min-w-0 flex-col p-5 text-white transition-all duration-500 sm:p-6 md:p-7 ${
                    isActive ? "opacity-100" : "opacity-100 md:translate-y-1"
                  }`}
                >

                  <h3 className={`mt-2 font-[var(--font-title-family)] font-light leading-[0.98] tracking-[-0.035em] text-white transition-[font-size] duration-500 ${isActive ? "text-[clamp(2.2rem,4vw,4.25rem)]" : "text-[1.75rem] md:text-[2rem]"}`}>
                    {masterClass.name}
                  </h3>

                  <div className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ${isActive ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}>
                    <div className="min-h-0 overflow-hidden">
                      <div className="mt-4 rounded-[20px] border border-white/20 bg-white/12 p-4 backdrop-blur-md">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/65">{c.topicLabel}</p>
                        <h4 className="mt-1.5 text-lg font-semibold leading-snug tracking-[-0.025em] text-white sm:text-xl">{masterClass.topic}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenClass(index)}
                        className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/50 bg-white/88 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-[#2f6f9f]"
                      >
                        {c.readMore}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
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
                      alt={activeClass.name}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 32vw, 380px"
                      className="object-cover"
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
