"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Globe,
  MapPin,
  Mic,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa6";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const CARD_GAP = 24;

export default function HomeSpeakers() {
  const { t } = useLanguage();
  const c = t.home.speakersSection;
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openSpeaker, setOpenSpeaker] = useState<number | null>(null);

  const getCardWidth = () => {
    const card = sliderRef.current?.querySelector<HTMLElement>(
      "[data-speaker-card]",
    );
    return card ? card.offsetWidth + CARD_GAP : null;
  };

  const updateActiveIndex = () => {
    const slider = sliderRef.current;
    const width = getCardWidth();
    if (!slider || !width) return;

    setActiveIndex(
      Math.min(c.speakers.length - 1, Math.round(slider.scrollLeft / width)),
    );
  };

  const scroll = (direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;
    const width = getCardWidth() ?? 420;

    slider.scrollBy({
      left: direction === "next" ? width : -width,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const slider = sliderRef.current;
    const width = getCardWidth();
    if (!slider || !width) return;

    slider.scrollTo({ left: index * width, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(170deg,#f3f8fb_0%,#ffffff_55%,#eef5fa_100%)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-14%] h-80 w-80 rounded-full bg-[#b9d9eb]/40 blur-3xl md:h-[460px] md:w-[460px]" />
        <div className="absolute bottom-[-18%] right-[-10%] h-80 w-80 rounded-full bg-[#72a8d4]/15 blur-3xl md:h-[480px] md:w-[480px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 text-center md:mb-14 md:flex-row md:items-end md:justify-between md:text-left">
          <div className="mx-auto max-w-3xl md:mx-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2 text-sm font-semibold text-[#2f6f9f] shadow-[0_14px_40px_rgba(42,66,82,0.08)] backdrop-blur-xl">
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

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              aria-label="Previous speaker"
              onClick={() => scroll("prev")}
              className="flex size-12 items-center justify-center rounded-full border border-[#b9d9eb]/60 bg-white/70 text-slate-900 shadow-[0_14px_40px_rgba(42,66,82,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#72a8d4]/50 hover:bg-white"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              aria-label="Next speaker"
              onClick={() => scroll("next")}
              className="flex size-12 items-center justify-center rounded-full border border-[#b9d9eb]/60 bg-white/70 text-slate-900 shadow-[0_14px_40px_rgba(42,66,82,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#72a8d4]/50 hover:bg-white"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={sliderRef}
        onScroll={updateActiveIndex}
        className="relative flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1rem,calc((100vw-1200px)/2))] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {c.speakers.map((speaker, index) => {
          const isOpen = openSpeaker === index;

          return (
            <motion.article
              key={speaker.name}
              data-speaker-card
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-[86vw] max-w-[420px] shrink-0 snap-start overflow-hidden rounded-[36px] border border-[#b9d9eb]/60 bg-white/70 shadow-[0_28px_90px_rgba(42,66,82,0.12)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/80 sm:w-[480px] sm:max-w-none lg:grid lg:w-[840px] lg:grid-cols-[340px_minmax(0,1fr)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#eef5f9] sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[460px]">
                <Image
                  src={speaker.photo}
                  alt={speaker.name}
                  fill
                  sizes="(max-width: 640px) 86vw, (max-width: 1024px) 480px, 340px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(16,24,42,0.28)_100%)] lg:bg-[linear-gradient(90deg,transparent_65%,rgba(243,248,251,0.4)_100%)]" />
              </div>

              <div className="flex flex-col gap-5 p-6 sm:p-7 lg:p-9">
                <div>
                  <h3 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950">
                    {speaker.name}
                  </h3>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f6f9f]">
                    <MapPin className="h-4 w-4" />
                    {speaker.city}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600 lg:line-clamp-4">
                    {speaker.role}
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#b9d9eb]/60 bg-[linear-gradient(150deg,rgba(185,217,235,0.28),rgba(255,255,255,0.75))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]">
                      {c.presentationLabel}
                    </p>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#72a8d4]/30 bg-white/70 px-3 py-1 text-xs font-semibold text-[#2f6f9f]">
                      <Mic className="h-3 w-3" />
                      {c.topicLabel}
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.03em] text-slate-950 sm:text-2xl">
                    {speaker.topic}
                  </h4>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          {speaker.description}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenSpeaker(isOpen ? null : index)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_10px_28px_rgba(42,66,82,0.08)] backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white hover:text-[#2f6f9f]"
                  >
                    {isOpen ? c.showLess : c.readMore}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap gap-3">
                  {speaker.instagram ? (
                    <a
                      href={speaker.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_10px_28px_rgba(42,66,82,0.08)] backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white hover:text-[#2f6f9f]"
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
                      className="inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_10px_28px_rgba(42,66,82,0.08)] backdrop-blur-xl transition hover:border-[#72a8d4]/50 hover:bg-white hover:text-[#2f6f9f]"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

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
    </section>
  );
}
