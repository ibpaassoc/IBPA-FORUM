"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Crown } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

import Link from "next/link";
import { winnersByYear } from "@/features/winners/data";

const winners = winnersByYear[2025].slice(0, 5);
const DESKTOP_CARD_WIDTH = 222;
const DESKTOP_GAP = 20;

export default function PreviousWinnersSection() {
  const { t } = useLanguage();
  const c = t.home.previousWinners;
  const sliderRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const layout = layoutRef.current;
    if (!layout) return;
    const measure = () => {
      const requiredWidth = winners.length * DESKTOP_CARD_WIDTH + (winners.length - 1) * DESKTOP_GAP;
      const gutter = parseFloat(getComputedStyle(layout).getPropertyValue("--page-gutter")) || 0;
      setShowAll(layout.clientWidth - gutter * 2 >= requiredWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(layout);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (showAll && sliderRef.current) sliderRef.current.scrollLeft = 0;
  }, [showAll]);

  const updateActiveIndex = () => {
    if (showAll) return;
    const slider = sliderRef.current;
    if (!slider) return;

    const card = slider.querySelector<HTMLElement>("[data-winner-card]");
    if (!card) return;

    const step = card.offsetWidth + 24;
    setActiveIndex(Math.round(slider.scrollLeft / step));
  };

  const scroll = (direction: "prev" | "next") => {
    if (showAll) return;
    const slider = sliderRef.current;
    if (!slider) return;

    const card = slider.querySelector<HTMLElement>("[data-winner-card]");
    const scrollAmount = card ? card.offsetWidth + 24 : 420;

    slider.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section ref={layoutRef} className="landing-section relative overflow-hidden py-20 md:py-28">
      <div className="absolute left-[-10%] top-1/4 h-72 w-72 rounded-full bg-[#b9d9eb]/14 blur-2xl" />

      <div className="page-section relative">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-4 max-w-4xl font-[var(--font-display)] text-[clamp(2.7rem,5vw,5.9rem)] leading-[0.9] tracking-[-0.055em] text-[#10182a]">
              {c.title}
            </h2>
          </div>

          {!showAll && <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              aria-label={c.prevLabel}
              onClick={() => scroll("prev")}
              className="flex size-11 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#10182a] backdrop-blur-xl transition hover:border-[#72a0c1]/45 hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#4987b3] md:size-12"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              aria-label={c.nextLabel}
              onClick={() => scroll("next")}
              className="flex size-11 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#10182a] backdrop-blur-xl transition hover:border-[#72a0c1]/45 hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#4987b3] md:size-12"
            >
              <ArrowRight size={18} />
            </button>
          </div>}
        </div>
      </div>

      <div
        ref={sliderRef}
        onScroll={updateActiveIndex}
        className={showAll
          ? "relative mx-auto flex w-fit max-w-full justify-center gap-5 overflow-visible px-0 pb-2"
          : "relative flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100vw-1200px)/2))] pb-2 [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"}
      >
        {winners.map((winner) => (
          <article
            key={winner.name}
            data-winner-card
            className={`group relative shrink-0 snap-start overflow-hidden border border-[#b9d9eb]/60 bg-white/86 p-2 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 ${showAll ? "w-[222px] rounded-[1.6rem]" : "w-[78vw] max-w-[390px] rounded-[2.3rem] sm:w-[390px]"}`}
          >
            <div className={`relative aspect-[4/5] overflow-hidden bg-[#eef5f9] ${showAll ? "rounded-[1.25rem]" : "rounded-[1.9rem]"}`}>
              <Image
                src={winner.image}
                alt={winner.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes={showAll ? "222px" : "(max-width: 640px) 78vw, 390px"}
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,42,0.02)_0%,rgba(16,24,42,0.04)_42%,rgba(16,24,42,0.72)_100%)]" />

              {winner.badge ? (
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/35 bg-black/35 px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                  <Crown size={13} />
                  {winner.badge}
                </div>
              ) : null}

              <div className={`absolute border border-white/25 bg-black/35 text-white backdrop-blur-2xl ${showAll ? "bottom-2 left-2 right-2 rounded-2xl p-3" : "bottom-4 left-4 right-4 rounded-[1.6rem] p-4"}`}>
                <h3 className={`font-[var(--font-display)] leading-none tracking-[-0.04em] ${showAll ? "text-[1.45rem]" : "text-3xl"}`}>
                  {winner.name}
                </h3>
                <p className={`mt-2 leading-5 text-white/78 ${showAll ? "text-[.68rem]" : "text-sm"}`}>
                  {winner.category}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!showAll && <div className="mt-6 flex justify-center gap-1">
        {winners.map((winner, index) => (
          <button
            key={winner.name}
            type="button"
            aria-label={`${c.goToLabel} ${index + 1}`}
            onClick={() => {
              const slider = sliderRef.current;
              const card = slider?.querySelector<HTMLElement>("[data-winner-card]");
              if (!slider || !card) return;

              slider.scrollTo({
                left: index * (card.offsetWidth + 24),
                behavior: "smooth",
              });
            }}
            className="grid size-11 place-items-center rounded-full focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-[#4987b3]"
          >
            <span aria-hidden="true" className={`size-3 rounded-full transition-colors duration-300 ${activeIndex === index ? "bg-[#72a0c1]" : "bg-[#72a0c1]/30 hover:bg-[#72a0c1]/50"}`} />
          </button>
        ))}
      </div>}
      <div className="page-section mt-10 flex justify-center">
        <Link href="/winners" className="group inline-flex min-h-12 items-center gap-4 rounded-full border border-[#72a0c1]/45 bg-white/80 px-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#254f72] transition hover:border-[#72a0c1] hover:bg-[#edf7fc] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#4987b3]">
          {t.home.previousWinners.seeAll} <ArrowUpRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}
