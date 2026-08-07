"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Crown } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const winners = [
  {
    name: "Tetiana Kysliuk",
    category: "Brow artist and Lash lamimaker",
    badge: "1st",
    image: "/images/winners/Tetiana_Kysliuk.jpg",
  },
  {
    name: "Anastasiia Sikova",
    category: "Nail artist and Educator",
    badge: "2nd",
    image: "/images/winners/Anastasiia_Sikova.jpg",
  },
  {
    name: "Masha Pixie",
    category: "Hairstylist and Mentor",
    badge: "3rd",
    image: "/images/winners/Masha_Pixie.jpg",
  },
  {
    name: "Svetlana Nesterova",
    category: "Makeup artist known for refined taste and trend vision",
    badge: "",
    image: "/images/winners/Svetlana_Nesterova.jpg",
  },
  {
    name: "Eleonora Bedyukh",
    category: "Brow and Lash expert, creator of an innovative approach to color and shape",
    badge: "",
    image: "/images/winners/Eleonora_Bedyukh.jpg",
  },
  {
    name: "Julia Karpus",
    category: "Massage therapist integrating aesthetics and Wellness",
    badge: "",
    image: "/images/winners/Julia_Karpus.jpg",
  },
  {
    name: "Diana Derkach",
    category: "Cosmetologist specializing in modern therapies and advanced Skincare",
    badge: "",
    image: "/images/winners/Diana_Derkach.jpg",
  },
  {
    name: "Natalia Yakovleva",
    category: "Nail master recognized for precision and contemporary design",
    badge: "",
    image: "/images/winners/Natalia_Yakovleva.jpg",
  },
  {
    name: "Natalia Firsova",
    category: "Hair extension specialist and creative Stylist",
    badge: "",
    image: "/images/winners/Natalia_Firsova.jpg",
  },
  {
    name: "Anastasiia Arabadzhy",
    category: "Nail artist known for elegance and attention to detail",
    badge: "",
    image: "/images/winners/Anastasiia_Arabadzhy.jpg",
  },
  {
    name: "Anastasia Shevchenko",
    category: "Brow artist and Lamimaker, emphasizing natural beauty and symmetry",
    badge: "",
    image: "/images/winners/Anastasia_Shevchenko.jpg",
  },
  {
    name: "Yulia Simonenko",
    category: "Nail expert, blending technique with artistic expression",
    badge: "",
    image: "/images/winners/Yulia_Simonenko.jpg",
  },
];

export default function PreviousWinnersSection() {
  const { t } = useLanguage();
  const c = t.home.previousWinners;
  const sliderRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const card = slider.querySelector<HTMLElement>("[data-winner-card]");
    if (!card) return;

    const step = card.offsetWidth + 24;
    setActiveIndex(Math.round(slider.scrollLeft / step));
  };

  const scroll = (direction: "prev" | "next") => {
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
    <section className="landing-section relative overflow-hidden py-20 md:py-28">
      <div className="absolute left-[-10%] top-1/4 h-72 w-72 rounded-full bg-[#b9d9eb]/14 blur-2xl" />

      <div className="page-section relative">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-4 max-w-4xl font-[var(--font-display)] text-[clamp(2.7rem,5vw,5.9rem)] leading-[0.9] tracking-[-0.055em] text-[#10182a]">
              {c.title}
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              aria-label={c.prevLabel}
              onClick={() => scroll("prev")}
              className="flex size-11 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#10182a] backdrop-blur-xl transition hover:border-[#72a0c1]/45 hover:bg-white md:size-12"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              aria-label={c.nextLabel}
              onClick={() => scroll("next")}
              className="flex size-11 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#10182a] backdrop-blur-xl transition hover:border-[#72a0c1]/45 hover:bg-white md:size-12"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={sliderRef}
        onScroll={updateActiveIndex}
        className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100vw-1200px)/2))] pb-2 [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {winners.map((winner) => (
          <article
            key={winner.name}
            data-winner-card
            className="group relative w-[78vw] max-w-[390px] shrink-0 snap-start overflow-hidden rounded-[2.3rem] border border-[#b9d9eb]/60 bg-white/86 p-2 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 sm:w-[390px]"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.9rem] bg-[#eef5f9]">
              <Image
                src={winner.image}
                alt={winner.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 78vw, 390px"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,42,0.02)_0%,rgba(16,24,42,0.04)_42%,rgba(16,24,42,0.72)_100%)]" />

              {winner.badge ? (
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/35 bg-black/35 px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                  <Crown size={13} />
                  {winner.badge}
                </div>
              ) : null}

              <div className="absolute bottom-4 left-4 right-4 rounded-[1.6rem] border border-white/25 bg-black/35 p-4 text-white backdrop-blur-2xl">
                <h3 className="font-[var(--font-display)] text-3xl leading-none tracking-[-0.04em]">
                  {winner.name}
                </h3>
                <p className="mt-2 text-sm leading-5 text-white/78">
                  {winner.category}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-3">
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
            className={`h-3 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "w-3 bg-[#72a0c1]"
                : "w-3 bg-[#72a0c1]/30 hover:bg-[#72a0c1]/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
