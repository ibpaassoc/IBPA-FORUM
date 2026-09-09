"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  GraduationCap,
  Sparkles,
  X,
} from "lucide-react";
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
  const [activeCard, setActiveCard] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const resetGallery = () => {
      gallery.scrollTo({ left: 0, behavior: "auto" });
      setActiveCard(0);
    };

    resetGallery();
    const frame = window.requestAnimationFrame(resetGallery);
    const timer = window.setTimeout(resetGallery, 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [masterClasses.length]);

  const moveGallery = (direction: 1 | -1) => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const nextIndex = Math.min(
      Math.max(activeCard + direction, 0),
      masterClasses.length - 1,
    );
    const nextCard = gallery.querySelector<HTMLElement>(
      `[data-master-card="${nextIndex}"]`,
    );
    if (!nextCard) return;

    const galleryLeft = gallery.getBoundingClientRect().left;
    const nextCardLeft = nextCard.getBoundingClientRect().left;
    const maxScrollLeft = gallery.scrollWidth - gallery.clientWidth;
    const targetScrollLeft = Math.min(
      Math.max(
        0,
        gallery.scrollLeft + nextCardLeft - galleryLeft,
      ),
      maxScrollLeft,
    );

    gallery.scrollTo({
      left: targetScrollLeft,
      behavior: reducedMotion ? "auto" : "smooth",
    });
    setActiveCard(nextIndex);
  };

  const updateActiveCard = () => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const cards = Array.from(
      gallery.querySelectorAll<HTMLElement>("[data-master-card]"),
    );
    const galleryLeft = gallery.getBoundingClientRect().left;
    const closestIndex = cards.reduce(
      (closest, card, index) =>
        Math.abs(card.getBoundingClientRect().left - galleryLeft) <
        Math.abs(cards[closest].getBoundingClientRect().left - galleryLeft)
          ? index
          : closest,
      0,
    );

    setActiveCard((currentIndex) =>
      currentIndex === closestIndex ? currentIndex : closestIndex,
    );
  };

  return (
    <section
      id="master-classes"
      className="relative overflow-hidden bg-[linear-gradient(110deg,#f4f9fc_0%,#ffffff_47%,#eef7fb_100%)] py-20 md:py-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-[#b9d9eb]/24 blur-3xl" />
        <div className="absolute right-[18%] top-[-12rem] h-[26rem] w-[26rem] rounded-full bg-white/70 blur-3xl" />
        <div className="absolute -right-40 bottom-28 h-[28rem] w-[28rem] rounded-full bg-[#72a0c1]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-[var(--landing-divider)]" />
      </div>

      <div className="page-section relative">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(16rem,0.36fr)_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-[22rem]">
            <div className="flex items-center gap-3 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#72a0c1]">
              <span className="size-1.5 rounded-full bg-[#72a0c1]" />
              <span>{c.eyebrow}</span>
            </div>

            <h2 className="mt-5 max-w-[11ch] font-[var(--font-title-family)] text-[clamp(3.35rem,6vw,6.8rem)] font-light uppercase leading-[0.78] tracking-[-0.045em] text-[var(--color-ink)]">
              {c.title}
            </h2>

            <p className="mt-7 max-w-[20rem] text-[0.96rem] leading-[1.7] text-[var(--color-ink-soft)] md:text-[1.02rem]">
              {c.description}
            </p>

            <a
              href="#program"
              className="group mt-7 inline-flex items-center gap-5 rounded-full border border-[#72a0c1]/35 bg-white/65 px-5 py-3 text-sm font-semibold text-[#2f6f9f] shadow-[0_12px_28px_rgba(114,160,193,0.1)] backdrop-blur-xl transition duration-200 hover:border-[#72a0c1]/65 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#72a0c1]/30"
            >
              <span>{c.ctaLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <div className="mt-10 grid max-w-[22rem] grid-cols-3 gap-3 border-t border-[#72a0c1]/20 pt-5">
              <div className="flex flex-col gap-2 text-[0.63rem] leading-[1.35] text-[#64788b]">
                <span className="flex size-8 items-center justify-center rounded-full border border-[#72a0c1]/55 text-[#2f6f9f]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span>{c.featurePractice}</span>
              </div>
              <div className="flex flex-col gap-2 text-[0.63rem] leading-[1.35] text-[#64788b]">
                <span className="flex size-8 items-center justify-center rounded-full border border-[#72a0c1]/55 text-[#2f6f9f]">
                  <GraduationCap className="h-3.5 w-3.5" />
                </span>
                <span>{c.featureTechniques}</span>
              </div>
              <div className="flex flex-col gap-2 text-[0.63rem] leading-[1.35] text-[#64788b]">
                <span className="flex size-8 items-center justify-center rounded-full border border-[#72a0c1]/55 text-[#2f6f9f]">
                  <Award className="h-3.5 w-3.5" />
                </span>
                <span>{c.featureCertificate}</span>
              </div>
            </div>
          </div>

          <div className="min-w-0 xl:mr-[calc((min(100vw,var(--content-width))-100vw)/2)]">
            <div className="mb-4 flex items-center justify-between gap-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#7a8b99]">
              <span>{c.sessionsLabel}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={c.previousLabel}
                  disabled={activeCard === 0}
                  onClick={() => moveGallery(-1)}
                  className="flex size-10 items-center justify-center rounded-full border border-[#72a0c1]/35 bg-white/70 text-[#2f6f9f] shadow-sm transition hover:border-[#72a0c1]/65 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#72a0c1]/30"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={c.nextLabel}
                  disabled={activeCard >= masterClasses.length - 1}
                  onClick={() => moveGallery(1)}
                  className="flex size-10 items-center justify-center rounded-full border border-[#72a0c1]/35 bg-white/70 text-[#2f6f9f] shadow-sm transition hover:border-[#72a0c1]/65 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#72a0c1]/30"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={galleryRef}
              onScroll={updateActiveCard}
              aria-label={c.galleryLabel}
              className="masterclass-gallery no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-5 pr-8 sm:gap-5"
            >
              {masterClasses.map((masterClass, index) => (
                <motion.button
                  type="button"
                  key={masterClass.name}
                  data-master-card={index}
                  aria-haspopup="dialog"
                  aria-label={`${c.readMore}: ${masterClass.name}`}
                  onClick={() => setOpenClass(index)}
                  whileHover={reducedMotion ? undefined : { y: -7, rotate: 0 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                  transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
                  style={{ rotate: reducedMotion ? 0 : index % 3 === 1 ? -1 : index % 3 === 2 ? 0.8 : 0 }}
                  className="group relative isolate aspect-[0.73] w-[min(72vw,19rem)] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[1.35rem] border border-white/80 bg-[#dcecf4] text-left shadow-[0_20px_45px_rgba(45,83,110,0.15)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#72a0c1]/55 sm:w-[min(43vw,18.5rem)] lg:w-[clamp(11.75rem,13.2vw,15.5rem)]"
                >
                  <Image
                    src={masterClass.photo}
                    alt={masterClass.name}
                    fill
                    quality={90}
                    sizes="(max-width: 639px) 72vw, (max-width: 1023px) 43vw, 17vw"
                    className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,42,0.04)_18%,rgba(16,24,42,0.08)_42%,rgba(8,17,33,0.94)_100%)]" />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 text-white/80">
                    <span className="font-[var(--font-accent)] text-[0.9rem] italic tracking-[0.08em]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full border border-white/30 bg-[#10182a]/25 px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.16em] backdrop-blur-md">
                      {c.formatLabel}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                    <h3 className="text-balance font-[var(--font-title-family)] text-[clamp(1.8rem,3.15vw,3rem)] font-light leading-[0.86] tracking-[-0.045em]">
                      {masterClass.name}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-[0.72rem] leading-[1.4] text-white/78">
                      {masterClass.topic}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-3 text-[0.65rem] font-semibold tracking-[0.05em] text-white/82">
                      <span>{c.detailsLabel}</span>
                      <span className="flex size-8 items-center justify-center rounded-full border border-white/45 transition duration-200 group-hover:border-white group-hover:bg-white group-hover:text-[#10182a]">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-2" aria-label={c.galleryProgressLabel}>
              {masterClasses.map((masterClass, index) => (
                <span
                  key={masterClass.name}
                  aria-hidden="true"
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === activeCard ? "w-10 bg-[#72a0c1]" : "w-1.5 bg-[#72a0c1]/30"
                  }`}
                />
              ))}
            </div>
          </div>
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
                      quality={75}
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
