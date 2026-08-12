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

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#b9d9eb]/65 bg-white/68 px-5 py-2.5 shadow-[0_10px_28px_rgba(114,160,193,0.1)] backdrop-blur-xl">
            <GraduationCap className="h-4 w-4 text-[#72a0c1]" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
              {String(masterClasses.length).padStart(2, "0")} {c.sessionsLabel}
            </span>
          </div>
        </div>

        <div className="mt-[var(--space-xl)] grid gap-6 lg:gap-8">
          {masterClasses.map((masterClass, index) => {
            const imageOnRight = index % 2 === 1;

            return (
              <article
                key={masterClass.name}
                className={`group grid min-w-0 overflow-hidden rounded-[34px] border border-[#b9d9eb]/45 bg-white/74 shadow-[0_20px_58px_rgba(114,160,193,0.12)] backdrop-blur-xl transition duration-300 hover:border-[#9fc7df]/70 hover:shadow-[0_24px_68px_rgba(114,160,193,0.17)] ${
                  imageOnRight
                    ? "md:grid-cols-[minmax(0,1.28fr)_minmax(240px,0.72fr)] lg:grid-cols-[minmax(0,1fr)_300px]"
                    : "md:grid-cols-[minmax(240px,0.72fr)_minmax(0,1.28fr)] lg:grid-cols-[300px_minmax(0,1fr)]"
                }`}
              >
                <div
                  className={`relative aspect-[4/5] min-w-0 overflow-hidden bg-[#eef5f9] md:aspect-auto md:min-h-[400px] ${
                    imageOnRight ? "md:order-2" : ""
                  }`}
                >
                  <Image
                    src={masterClass.photo}
                    alt={masterClass.name}
                    fill
                    sizes="(max-width: 767px) 100vw, 300px"
                    className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(16,24,42,0.38)_100%)]" />

                  <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/72 px-3.5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#2f6f9f] shadow-sm backdrop-blur-xl">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="h-3 w-px bg-[#72a0c1]/35" />
                    <span>{c.formatLabel}</span>
                  </div>

                  {masterClass.secondaryPhoto ? (
                    <div className="absolute bottom-5 right-5 aspect-[3/4] w-20 overflow-hidden rounded-[18px] border-2 border-white/80 bg-white shadow-[0_16px_36px_rgba(16,24,42,0.22)] sm:w-24">
                      <Image
                        src={masterClass.secondaryPhoto}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>

                <div
                  className={`flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10 ${
                    imageOnRight ? "md:order-1" : ""
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#72a0c1]">
                    {c.formatLabel}
                  </p>

                  <h3 className="mt-3 font-[var(--font-title-family)] text-[clamp(2.25rem,4vw,4rem)] font-light leading-[0.98] tracking-[-0.035em] text-[var(--color-ink)]">
                    {masterClass.name}
                  </h3>

                  <p className="mt-5 line-clamp-4 text-sm leading-7 text-[var(--color-ink-soft)] sm:text-[0.96rem]">
                    {masterClass.role}
                  </p>

                  <div className="mt-6 rounded-[24px] border border-[#b9d9eb]/55 bg-[linear-gradient(145deg,rgba(242,248,251,0.92),rgba(255,255,255,0.76))] p-5 sm:p-6">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]">
                      {c.topicLabel}
                    </p>
                    <h4 className="mt-2 text-xl font-semibold leading-snug tracking-[-0.025em] text-slate-950 sm:text-2xl">
                      {masterClass.topic}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenClass(index)}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#b9d9eb]/75 bg-white/75 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#72a0c1]/55 hover:bg-white hover:text-[#2f6f9f]"
                  >
                    {c.readMore}
                    <ArrowRight className="h-4 w-4" />
                  </button>
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
                      <h3 className="pr-12 font-[var(--font-title-family)] text-4xl font-light leading-none tracking-[-0.035em] sm:text-5xl lg:text-[3.4rem]">
                        {activeClass.name}
                      </h3>
                    </div>
                  </div>

                  <div className="min-w-0 p-6 sm:p-7 md:h-full md:overflow-y-auto lg:overflow-hidden lg:p-5 xl:p-8">
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
