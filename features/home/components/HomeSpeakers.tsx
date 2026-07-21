"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  MapPin,
  Mic,
  X,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa6";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeSpeakers() {
  const { t } = useLanguage();
  const c = t.home.speakersSection;
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openSpeaker, setOpenSpeaker] = useState<number | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const check = () =>
      setIsScrollable(slider.scrollWidth > slider.clientWidth + 1);

    check();
    const observer = new ResizeObserver(check);
    observer.observe(slider);
    return () => observer.disconnect();
  }, [c.speakers.length]);

  useEffect(() => {
    if (openSpeaker === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSpeaker(null);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openSpeaker]);

  const getCardStep = () => {
    const slider = sliderRef.current;
    const card = slider?.querySelector<HTMLElement>("[data-speaker-card]");
    if (!slider || !card) return null;

    const gap = Number.parseFloat(getComputedStyle(slider).columnGap || "0");
    return card.offsetWidth + (Number.isFinite(gap) ? gap : 0);
  };

  const updateActiveIndex = () => {
    const slider = sliderRef.current;
    const step = getCardStep();
    if (!slider || !step) return;

    setActiveIndex(
      Math.min(c.speakers.length - 1, Math.round(slider.scrollLeft / step)),
    );
  };

  const scroll = (direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;
    const step = getCardStep() ?? 420;

    slider.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const slider = sliderRef.current;
    const step = getCardStep();
    if (!slider || !step) return;

    slider.scrollTo({ left: index * step, behavior: "smooth" });
  };

  const activeSpeaker = openSpeaker !== null ? c.speakers[openSpeaker] : null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(170deg,#f3f8fb_0%,#ffffff_55%,#eef5fa_100%)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-14%] h-80 w-80 rounded-full bg-[#b9d9eb]/30 blur-3xl md:h-[460px] md:w-[460px]" />
        <div className="absolute bottom-[-18%] right-[-10%] h-80 w-80 rounded-full bg-[#72a8d4]/12 blur-3xl md:h-[480px] md:w-[480px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 text-center md:mb-14 md:flex-row md:items-end md:justify-between md:text-left">
          <div className="mx-auto max-w-3xl md:mx-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2 text-sm font-semibold text-[#2f6f9f] backdrop-blur-xl">
              <Mic className="h-4 w-4" />
              {c.eyebrow}
            </div>

            <h2 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
              {c.title}
            </h2>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-600 md:text-lg">
              {c.description}
            </p>
          </div>

          {isScrollable ? (
            <div className="hidden items-center gap-3 md:flex">
              <button
                type="button"
                aria-label="Previous speaker"
                onClick={() => scroll("prev")}
                className="flex size-12 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-slate-900 backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                type="button"
                aria-label="Next speaker"
                onClick={() => scroll("next")}
                className="flex size-12 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-slate-900 backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={sliderRef}
        data-speakers-slider
        onScroll={updateActiveIndex}
        className="relative flex snap-x snap-mandatory scroll-px-[var(--page-gutter)] gap-6 overflow-x-auto overscroll-x-contain scroll-smooth px-[var(--page-gutter)] pb-4 pt-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] md:scroll-px-[max(1rem,calc((100vw-1200px)/2))] md:px-[max(1rem,calc((100vw-1200px)/2))] [&::-webkit-scrollbar]:hidden"
      >
        {c.speakers.map((speaker, index) => (
          <motion.article
            key={speaker.name}
            data-speaker-card
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-[calc(100vw-(2*var(--page-gutter)))] max-w-[420px] shrink-0 snap-start overflow-hidden rounded-[36px] border border-[#b9d9eb]/60 bg-white/70 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/85 sm:w-[480px] sm:max-w-none lg:grid lg:w-[580px] lg:grid-cols-[240px_minmax(0,1fr)]"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#eef5f9] sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[380px]">
              <Image
                src={speaker.photo}
                alt={speaker.name}
                fill
                sizes="(max-width: 640px) calc(100vw - (2 * var(--page-gutter))), (max-width: 1024px) 480px, 240px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(16,24,42,0.24)_100%)] lg:bg-[linear-gradient(90deg,transparent_70%,rgba(243,248,251,0.35)_100%)]" />
            </div>

            <div className="flex flex-col gap-4 p-6 sm:p-7">
              <div>
                <h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-3xl">
                  {speaker.name}
                </h3>

                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f6f9f]">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {speaker.city}
                </p>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {speaker.role}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#b9d9eb]/60 bg-[linear-gradient(150deg,rgba(185,217,235,0.24),rgba(255,255,255,0.7))] p-5 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]">
                  {c.topicLabel}
                </p>

                <h4 className="mt-2 line-clamp-3 text-lg font-semibold leading-snug tracking-[-0.03em] text-slate-950">
                  {speaker.topic}
                </h4>

                <button
                  type="button"
                  onClick={() => setOpenSpeaker(index)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white hover:text-[#2f6f9f]"
                >
                  {c.readMore}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-auto flex flex-wrap gap-3">
                {speaker.instagram ? (
                  <a
                    href={speaker.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white hover:text-[#2f6f9f]"
                  >
                    <FaInstagram className="h-4 w-4" />
                    Instagram
                  </a>
                ) : null}

                {speaker.website ? (
                  <a
                    href={speaker.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white hover:text-[#2f6f9f]"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                ) : null}
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {isScrollable ? (
        <div className="mt-8 flex justify-center gap-3">
          {c.speakers.map((speaker, index) => (
            <button
              key={speaker.name}
              type="button"
              aria-label={`Go to speaker ${index + 1}`}
              aria-current={activeIndex === index}
              onClick={() => scrollToIndex(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "w-8 bg-[#72a8d4]"
                  : "w-3 bg-[#72a8d4]/30 hover:bg-[#72a8d4]/50"
              }`}
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {activeSpeaker ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-[#10182a]/45 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => setOpenSpeaker(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={activeSpeaker.name}
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] border border-[#b9d9eb]/60 bg-white/85 backdrop-blur-2xl sm:rounded-[2.3rem]"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpenSpeaker(null)}
                className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/80 text-slate-900 backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white"
              >
                <X size={18} />
              </button>

              <div className="overflow-y-auto overscroll-contain p-2">
                <div className="grid gap-0 sm:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem] bg-[#eef5f9] sm:aspect-auto sm:min-h-[320px]">
                    <Image
                      src={activeSpeaker.photo}
                      alt={activeSpeaker.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 260px"
                      className="object-cover object-[center_25%]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,42,0.02)_0%,rgba(16,24,42,0.04)_42%,rgba(16,24,42,0.55)_100%)] sm:bg-none" />

                    <div className="absolute bottom-3 left-3 right-3 rounded-[1.2rem] border border-white/25 bg-black/35 p-4 text-white backdrop-blur-2xl sm:hidden">
                      <h3 className="text-2xl font-semibold leading-none tracking-[-0.04em]">
                        {activeSpeaker.name}
                      </h3>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/85">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {activeSpeaker.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 p-5 sm:p-7">
                    <div className="hidden sm:block">
                      <h3 className="pr-10 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950">
                        {activeSpeaker.name}
                      </h3>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f6f9f]">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {activeSpeaker.city}
                      </p>
                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {activeSpeaker.role}
                    </p>

                    <div className="rounded-[1.6rem] border border-[#b9d9eb]/60 bg-[linear-gradient(150deg,rgba(185,217,235,0.24),rgba(255,255,255,0.7))] p-5 backdrop-blur-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]">
                          {c.topicLabel}
                        </p>
                      </div>

                      <h4 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.03em] text-slate-950 sm:text-2xl">
                        {activeSpeaker.topic}
                      </h4>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {activeSpeaker.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {activeSpeaker.instagram ? (
                        <a
                          href={activeSpeaker.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white hover:text-[#2f6f9f]"
                        >
                          <FaInstagram className="h-4 w-4" />
                          Instagram
                        </a>
                      ) : null}

                      {activeSpeaker.website ? (
                        <a
                          href={activeSpeaker.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white hover:text-[#2f6f9f]"
                        >
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
