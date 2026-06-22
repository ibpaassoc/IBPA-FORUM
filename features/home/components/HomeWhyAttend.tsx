"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const ITEM_IMAGES = [
  "/images/community/white_group.jpg",
  "/images/events/DSC00272.jpg",
  "/images/events/DSC00932.jpg",
  "/images/events/DSC01248.jpg",
] as const;

export default function HomeWhyAttend() {
  const { t } = useLanguage();
  const wa = t.home.whyAttend;
  const items = wa.items;
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => Math.max(0, i - 1));
  const next = () => setActive((i) => Math.min(items.length - 1, i + 1));

  return (
    <section className="section-rhythm-loose overflow-hidden bg-white">
      <div className="page-section">
        {/* Header row */}
        <div className="mb-[var(--space-xl)] flex items-end justify-between gap-6">
          <Reveal>
            <div>
              <p className="page-eyebrow mb-[var(--space-sm)]">{wa.eyebrow}</p>
              <h2 className="font-[var(--font-title-family)] text-[clamp(1.9rem,3.5vw,3rem)] font-light leading-[1.08] text-[var(--color-ink)]">
                {wa.title ?? "Why Attend"}
              </h2>
            </div>
          </Reveal>

          {/* Arrow controls */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={prev}
              disabled={active === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-white text-[var(--color-ink)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--color-ink)] hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={18} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              disabled={active === items.length - 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-white text-[var(--color-ink)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--color-ink)] hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Slide track */}
        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(calc(-${active} * (min(85vw, 480px) + 1.5rem)))` }}
          >
            {items.map((item, index) => {
              const imgSrc = ITEM_IMAGES[index % ITEM_IMAGES.length];
              const isActive = index === active;

              return (
                <article
                  key={item.title}
                  className="relative w-[min(85vw,480px)] shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-glass)] shadow-[var(--shadow-glass)] transition-all duration-500"
                  style={{
                    opacity: isActive ? 1 : 0.55,
                    transform: isActive ? "scale(1)" : "scale(0.97)",
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={imgSrc}
                      alt={item.title}
                      fill
                      sizes="480px"
                      className="object-cover transition-transform duration-700"
                    />
                    {/* Number badge */}
                    <div className="premium-glass-blue absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full">
                      <span className="font-[var(--font-title-family)] text-[0.75rem] text-[var(--color-ink)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white p-7">
                    <h3 className="font-[var(--font-title-family)] text-[clamp(1.3rem,2vw,1.65rem)] font-light leading-[1.12] text-[var(--color-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[0.93rem] leading-[1.75] text-[var(--color-ink-soft)]">
                      {item.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === active
                  ? "w-8 bg-[var(--color-blue)]"
                  : "w-1.5 bg-[var(--color-blue-soft)]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
