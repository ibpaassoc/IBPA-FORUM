"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const ITEM_IMAGES = [
  "/images/community/white_group.jpg",
  "/images/DSC00947.jpg",
  "/images/prizes.png",
  "/images/events/check.png",
] as const;

export default function HomeWhyAttend() {
  const { t } = useLanguage();
  const wa = t.home.whyAttend;
  const items = wa.items;

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const activeItem = items[active];
  const activeImage = ITEM_IMAGES[active % ITEM_IMAGES.length];

  const canPrev = active > 0;
  const canNext = active < items.length - 1;

  const previewItems = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        image: ITEM_IMAGES[index % ITEM_IMAGES.length],
        index,
      })),
    [items],
  );

  const goTo = (index: number) => {
    if (index === active) return;
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  const prev = () => {
    if (!canPrev) return;
    setDirection(-1);
    setActive((index) => index - 1);
  };

  const next = () => {
    if (!canNext) return;
    setDirection(1);
    setActive((index) => index + 1);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -70) next();
    if (info.offset.x > 70) prev();
  };

  return (
    <section className="section-rhythm-loose overflow-hidden bg-white">
      <div className="page-section">
        <div className="mx-auto max-w-7xl">
          <div className="mb-[var(--space-lg)] flex items-end justify-between gap-6">
            <Reveal>
              <div>
                <p className="page-eyebrow mb-[var(--space-sm)]">{wa.eyebrow}</p>
                <h2 className="font-[var(--font-title-family)] text-[clamp(2.8rem,6vw,5.2rem)] font-light leading-[0.92] tracking-[-0.035em] text-[var(--color-ink)]">
                  Why Attend
                </h2>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={prev}
                  disabled={!canPrev}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b9d9eb]/55 bg-white/55 text-[#24394b] shadow-[0_10px_30px_rgba(122,152,175,0.12)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-0.5 hover:border-[#8eb6d3]/70 disabled:pointer-events-none disabled:opacity-35"
                >
                  <ChevronLeft size={18} strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  aria-label="Next"
                  onClick={next}
                  disabled={!canNext}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b9d9eb]/55 bg-white/55 text-[#24394b] shadow-[0_10px_30px_rgba(122,152,175,0.12)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-0.5 hover:border-[#8eb6d3]/70 disabled:pointer-events-none disabled:opacity-35"
                >
                  <ChevronRight size={18} strokeWidth={1.8} />
                </button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-[2.75rem] border border-[#b9d9eb]/45 bg-white/[0.28] p-3 shadow-[0_32px_100px_rgba(20,49,71,0.1)] backdrop-blur-2xl">
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

              <div className="grid items-start gap-5 xl:grid-cols-[1.45fr_0.85fr]">
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.08}
                  onDragEnd={handleDragEnd}
                  className="relative"
                >
                  <div className="relative h-[420px] overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_24px_70px_rgba(20,49,71,0.10)] backdrop-blur-2xl md:h-[500px] xl:h-[560px]">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={active}
                        custom={direction}
                        initial={{
                          opacity: 0,
                          x: direction > 0 ? 90 : -90,
                          scale: 1.035,
                          filter: "blur(14px)",
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: 1,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          opacity: 0,
                          x: direction > 0 ? -90 : 90,
                          scale: 0.985,
                          filter: "blur(14px)",
                        }}
                        transition={{ duration: 0.58, ease: [0.19, 1, 0.22, 1] }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={activeImage}
                          alt={activeItem.title}
                          fill
                          sizes="(max-width: 1280px) 100vw, 62vw"
                          className="object-cover"
                        />
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_52%,rgba(255,255,255,0.18)_100%)]" />
                  </div>
                </motion.div>

                <div className="hidden h-[420px] self-start xl:grid xl:h-[560px] xl:grid-rows-4 xl:gap-3">
                  {previewItems.map((item) => {
                    const isActive = item.index === active;

                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => goTo(item.index)}
                        className={`group relative h-full overflow-hidden rounded-[1.55rem] border p-3 text-left backdrop-blur-2xl transition-all duration-500 ${
                          isActive
                            ? "border-[#8eb6d3]/65 bg-white/68 shadow-[0_18px_48px_rgba(122,152,175,0.16)]"
                            : "border-white/55 bg-white/34 shadow-[0_8px_28px_rgba(122,152,175,0.07)] hover:-translate-y-0.5 hover:border-[#b9d9eb]/70 hover:bg-white/54"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.15rem] border border-white/65 bg-white/35">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="96px"
                              className={`object-cover transition-all duration-700 ${
                                isActive
                                  ? "scale-105"
                                  : "scale-100 opacity-75 group-hover:opacity-100"
                              }`}
                            />
                          </div>

                          <div className="min-w-0 py-1">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="font-[var(--font-title-family)] text-[0.78rem] text-[var(--color-blue)]">
                                {String(item.index + 1).padStart(2, "0")}
                              </span>

                              {isActive && (
                                <motion.span
                                  layoutId="why-attend-active-line"
                                  className="h-px w-8 bg-[var(--color-blue)]/60"
                                />
                              )}
                            </div>

                            <h4 className="line-clamp-2 font-[var(--font-title-family)] text-[1.35rem] font-light leading-[1.05] text-[var(--color-ink)]">
                              {item.title}
                            </h4>

                            <p className="mt-2 line-clamp-2 text-[0.82rem] leading-[1.55] text-[var(--color-ink-soft)]">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative mt-3 overflow-hidden rounded-[2rem] border border-white/70 bg-white/64 p-6 shadow-[0_24px_80px_rgba(20,49,71,0.13)] backdrop-blur-[30px] md:p-8 xl:mt-5">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeItem.title}
                    custom={direction}
                    initial={{
                      opacity: 0,
                      x: direction > 0 ? 42 : -42,
                      filter: "blur(12px)",
                    }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{
                      opacity: 0,
                      x: direction > 0 ? -42 : 42,
                      filter: "blur(12px)",
                    }}
                    transition={{ duration: 0.42, ease: [0.19, 1, 0.22, 1] }}
                    className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end"
                  >
                    <div>
                      <div className="mb-5 flex items-center gap-3">
                        <span className="rounded-full border border-[#b9d9eb]/55 bg-white/65 px-3 py-1.5 font-[var(--font-title-family)] text-[0.78rem] text-[var(--color-ink)] backdrop-blur-xl">
                          {String(active + 1).padStart(2, "0")}
                        </span>

                        <div className="h-px w-10 bg-[var(--color-blue)]/45" />
                      </div>

                      <h3 className="font-[var(--font-title-family)] text-[clamp(2.35rem,5vw,4.7rem)] font-light leading-[0.92] tracking-[-0.035em] text-[var(--color-ink)]">
                        {activeItem.title}
                      </h3>
                    </div>

                    <div>
                      <p className="max-w-2xl text-[0.98rem] leading-[1.8] text-[var(--color-ink-soft)]">
                        {activeItem.description}
                      </p>

                      <div className="mt-6 flex items-center gap-1.5">
                        {items.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-label={`Go to slide ${index + 1}`}
                            onClick={() => goTo(index)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              index === active
                                ? "w-9 bg-[var(--color-blue)]"
                                : "w-1.5 bg-[#b9d9eb]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 xl:hidden">
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={prev}
                  disabled={!canPrev}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b9d9eb]/55 bg-white/55 text-[#24394b] backdrop-blur-2xl disabled:opacity-35"
                >
                  <ChevronLeft size={18} strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  aria-label="Next"
                  onClick={next}
                  disabled={!canNext}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b9d9eb]/55 bg-white/55 text-[#24394b] backdrop-blur-2xl disabled:opacity-35"
                >
                  <ChevronRight size={18} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
