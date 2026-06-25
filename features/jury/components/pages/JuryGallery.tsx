"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const photos = [
  "/images/juryGallery/1.jpg",
  "/images/juryGallery/2.jpg",
  "/images/juryGallery/3.jpg",
  "/images/juryGallery/4.jpg",
  "/images/juryGallery/5.jpg",
  "/images/juryGallery/6.jpg",
];

export default function JuryGallery() {
  const { t } = useLanguage();
  const c = t.juryPage.gallery;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    const slider = sliderRef.current;
    const card = slider?.querySelector<HTMLElement>("[data-photo-card]");
    if (!slider || !card) return;

    const nextIndex = (index + photos.length) % photos.length;

    slider.scrollTo({
      left: nextIndex * (card.offsetWidth + 24),
      behavior: "smooth",
    });

    setActiveIndex(nextIndex);
  };

  const updateActiveIndex = () => {
    const slider = sliderRef.current;
    const card = slider?.querySelector<HTMLElement>("[data-photo-card]");
    if (!slider || !card) return;

    const step = card.offsetWidth + 24;
    setActiveIndex(Math.round(slider.scrollLeft / step));
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      scrollToIndex(activeIndex + 1);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [activeIndex]);

  return (
    <section className="landing-section relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-12%] top-20 h-80 w-80 rounded-full bg-[#b9d9eb]/16 blur-2xl" />
        <div className="absolute bottom-10 left-[-10%] h-72 w-72 rounded-full bg-[#72a0c1]/10 blur-2xl" />
      </div>

      <div className="page-section relative">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-4xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-4 font-(--font-display) text-[clamp(2.7rem,5vw,5.9rem)] leading-[0.9] tracking-[-0.055em] text-[#10182a]">
              {c.title}
            </h2>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              aria-label={c.prevLabel}
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="flex size-11 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#10182a] backdrop-blur-xl transition hover:border-[#72a0c1]/45 hover:bg-white md:size-12"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              aria-label={c.nextLabel}
              onClick={() => scrollToIndex(activeIndex + 1)}
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
        {photos.map((photo, index) => (
          <article
            key={photo}
            data-photo-card
            className="group relative w-[82vw] max-w-[520px] shrink-0 snap-center overflow-hidden rounded-[2.4rem] border border-[#b9d9eb]/60 bg-white/80 p-2 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 sm:w-[520px]"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#eef5f9]">
              <Image
                src={photo}
                alt={`${c.photoAlt} ${index + 1}`}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.025]"
                sizes="(max-width: 640px) 82vw, 520px"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,42,0.02)_0%,rgba(16,24,42,0.02)_45%,rgba(16,24,42,0.42)_100%)]" />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/35 bg-white/20 px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                <Camera size={13} />
                {String(index + 1).padStart(2, "0")}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            aria-label={`${c.goToLabel} ${index + 1}`}
            onClick={() => scrollToIndex(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "w-8 bg-[#72a0c1]"
                : "w-3 bg-[#72a0c1]/30 hover:bg-[#72a0c1]/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
