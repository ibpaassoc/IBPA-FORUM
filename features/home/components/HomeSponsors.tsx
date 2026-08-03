"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Globe, Handshake, Mail, MapPin } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/translations";
import { Reveal } from "@/shared/components/public";

type SponsorsCopy = Translations["home"]["sponsorsSection"];
type Sponsor = SponsorsCopy["sponsors"][number];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(47,111,159,0.42)]";

const META_LABEL_CLASS =
  "font-(--font-ui-family) text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#2f6f9f]";

const META_LINK_CLASS = `inline-flex min-h-11 max-w-full items-center gap-2 break-all rounded-full border border-[#b9d9eb]/65 bg-white/64 px-4 py-2 text-sm font-medium text-[#24394b] underline-offset-4 backdrop-blur-xl transition-colors hover:border-[#72a0c1]/65 hover:bg-white hover:text-[#2f6f9f] hover:underline ${FOCUS_RING}`;

const pad = (value: number) => String(value).padStart(2, "0");

function SponsorStory({
  sponsor,
  copy,
  isActive,
  shouldAnimate,
}: {
  sponsor: Sponsor;
  copy: SponsorsCopy;
  isActive: boolean;
  shouldAnimate: boolean;
}) {
  const transition = {
    duration: shouldAnimate ? 0.56 : 0.01,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <article
      aria-label={sponsor.name}
      className="relative grid min-h-[31rem] grid-rows-[auto_1fr] gap-9 py-3 sm:min-h-[30rem] sm:gap-10 md:grid-cols-[minmax(17rem,0.82fr)_minmax(0,1.35fr)] md:grid-rows-1 md:items-center md:gap-12 lg:min-h-[27rem] lg:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.45fr)] lg:gap-16"
    >
      <motion.div
        animate={{
          opacity: isActive ? 1 : 0.25,
          scale: isActive ? 1 : 0.93,
          x: isActive ? 0 : 16,
          filter: isActive ? "blur(0px)" : "blur(1.5px)",
        }}
        transition={transition}
        className="relative z-10 origin-left"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-2 -translate-y-2 rounded-[2rem] border border-[#b9d9eb]/45 bg-white/34 sm:-translate-x-3 sm:-translate-y-3"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-[2rem] border border-[#b9d9eb]/38 bg-white/28 sm:translate-x-3 sm:translate-y-3"
        />
        <div className="relative flex min-h-56 items-center justify-center rounded-[2rem] border border-[#a9d2e8]/75 bg-white/58 px-7 py-10 shadow-[0_20px_48px_rgba(114,160,193,0.14),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:min-h-64 sm:px-10 sm:py-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-px h-px bg-white/90"
          />
          <div className="relative h-24 w-full max-w-[18rem] sm:h-28">
            <Image
              src={sponsor.logo}
              alt={sponsor.logoAlt}
              fill
              sizes="(min-width: 1024px) 19rem, (min-width: 640px) 18rem, calc(100vw - 9rem)"
              className="object-contain"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{
          opacity: isActive ? 1 : 0,
          y: isActive ? 0 : 18,
          x: isActive ? 0 : 8,
        }}
        transition={{
          ...transition,
          delay: isActive && shouldAnimate ? 0.05 : 0,
        }}
        className="min-w-0 py-1 md:py-5"
      >
        <h3 className="font-(--font-display) text-[clamp(2rem,3.25vw,3.35rem)] leading-[1.02] tracking-[-0.045em] text-[#10182a]">
          {sponsor.name}
        </h3>

        <p className="page-copy mt-4 max-w-2xl text-pretty">{sponsor.description}</p>

        <dl className="mt-7 grid gap-x-7 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className={META_LABEL_CLASS}>{copy.metaLocation}</dt>
            <dd className="mt-2 inline-flex min-h-11 max-w-full items-center gap-2 break-words text-sm font-medium text-[#24394b]">
              <MapPin className="h-4 w-4 shrink-0 text-[#72a0c1]" aria-hidden="true" />
              {sponsor.location}
            </dd>
          </div>

          {sponsor.website ? (
            <div>
              <dt className={META_LABEL_CLASS}>{copy.metaWebsite}</dt>
              <dd className="mt-2">
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={META_LINK_CLASS}
                >
                  <Globe className="h-4 w-4 shrink-0 text-[#72a0c1]" aria-hidden="true" />
                  {sponsor.websiteLabel}
                </a>
              </dd>
            </div>
          ) : null}

          {sponsor.instagram ? (
            <div>
              <dt className={META_LABEL_CLASS}>{copy.metaInstagram}</dt>
              <dd className="mt-2">
                <a
                  href={sponsor.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={META_LINK_CLASS}
                >
                  <FaInstagram className="h-4 w-4 shrink-0 text-[#72a0c1]" aria-hidden="true" />
                  {sponsor.instagramLabel}
                </a>
              </dd>
            </div>
          ) : null}

          {sponsor.email ? (
            <div>
              <dt className={META_LABEL_CLASS}>{copy.metaEmail}</dt>
              <dd className="mt-2">
                <a href={`mailto:${sponsor.email}`} className={META_LINK_CLASS}>
                  <Mail className="h-4 w-4 shrink-0 text-[#72a0c1]" aria-hidden="true" />
                  {sponsor.email}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </motion.div>
    </article>
  );
}

export default function SponsorsSection() {
  const { t } = useLanguage();
  const copy = t.home.sponsorsSection;
  const sponsors = copy.sponsors;
  const reducedMotion = useReducedMotion();
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    didDrag: false,
    horizontal: false,
  });
  const [activeIndexState, setActiveIndex] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const isSlider = sponsors.length > 1;
  const shouldAnimate = !reducedMotion && isPageVisible;
  const activeIndex = Math.max(0, Math.min(activeIndexState, sponsors.length - 1));

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const getStep = () => {
    const slider = sliderRef.current;
    const slide = slider?.querySelector<HTMLElement>("[data-sponsor-slide]");
    if (!slider || !slide) return null;

    const gap = Number.parseFloat(getComputedStyle(slider).columnGap || "0");
    return slide.offsetWidth + (Number.isFinite(gap) ? gap : 0);
  };

  const clampIndex = (index: number) =>
    Math.max(0, Math.min(sponsors.length - 1, index));

  const updateActiveIndex = () => {
    const slider = sliderRef.current;
    const step = getStep();
    if (!slider || !step) return;

    const index = clampIndex(Math.round(slider.scrollLeft / step));
    setActiveIndex((current) => (current === index ? current : index));
  };

  const scrollToIndex = (index: number) => {
    const slider = sliderRef.current;
    const step = getStep();
    if (!slider || !step) return;

    slider.scrollTo({
      left: clampIndex(index) * step,
      behavior: shouldAnimate ? "smooth" : "auto",
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isSlider || event.pointerType === "touch" && event.isPrimary === false) return;
    const slider = sliderRef.current;
    if (!slider) return;

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: slider.scrollLeft,
      didDrag: false,
      horizontal: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    const drag = dragState.current;
    if (!slider || drag.pointerId !== event.pointerId) return;

    const distanceX = event.clientX - drag.startX;
    const distanceY = event.clientY - drag.startY;
    if (!drag.horizontal) {
      if (Math.abs(distanceY) > Math.abs(distanceX) && Math.abs(distanceY) > 5) return;
      if (Math.abs(distanceX) < 5) return;
      drag.horizontal = true;
      slider.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    drag.didDrag = true;
    slider.scrollLeft = drag.startScrollLeft - distanceX;
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    const drag = dragState.current;
    if (!slider || drag.pointerId !== event.pointerId) return;

    if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);
    dragState.current.pointerId = -1;
    window.setTimeout(() => {
      dragState.current.didDrag = false;
    }, 0);
  };

  const suppressDraggedLink = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.didDrag) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleRailPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const rail = event.currentTarget.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (event.clientX - rail.left) / rail.width));
    scrollToIndex(Math.round(position * (sponsors.length - 1)));
  };

  if (!sponsors.length) return null;

  const progress = sponsors.length > 1 ? (activeIndex / (sponsors.length - 1)) * 100 : 0;

  return (
    <section
      id="sponsors"
      aria-labelledby="sponsors-heading"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f5fafe_52%,#eef7fc_100%)] py-20 md:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[18%] h-72 w-72 rounded-full bg-[#d5ecf8]/44 blur-3xl md:h-[30rem] md:w-[30rem]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-72 w-72 rounded-full bg-[#b9d9eb]/24 blur-3xl md:h-[32rem] md:w-[32rem]" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2 font-(--font-ui-family) text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f] backdrop-blur-xl">
              <Handshake className="h-4 w-4" aria-hidden="true" />
              {copy.eyebrow}
            </div>

            <h2
              id="sponsors-heading"
              className="text-balance font-(--font-display) text-[clamp(2.65rem,5.2vw,5.6rem)] leading-[0.94] tracking-[-0.055em] text-[#10182a]"
            >
              {copy.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 md:mt-14">
          {isSlider ? (
            <div
              ref={sliderRef}
              role="region"
              aria-label={copy.sliderLabel}
              tabIndex={0}
              onScroll={updateActiveIndex}
              onKeyDown={handleKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onClickCapture={suppressDraggedLink}
              className={`group flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pr-[4.5rem] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [touch-action:pan-y] md:gap-8 md:pr-40 [&::-webkit-scrollbar]:hidden ${FOCUS_RING}`}
            >
              {sponsors.map((sponsor, index) => (
                <div
                  key={sponsor.id}
                  data-sponsor-slide
                  aria-current={activeIndex === index ? "true" : undefined}
                  className="w-[calc(100%-4.5rem)] shrink-0 snap-start md:w-[calc(100%-10rem)]"
                >
                  <SponsorStory
                    sponsor={sponsor}
                    copy={copy}
                    isActive={activeIndex === index}
                    shouldAnimate={shouldAnimate}
                  />
                </div>
              ))}
            </div>
          ) : (
            <SponsorStory
              sponsor={sponsors[0]}
              copy={copy}
              isActive
              shouldAnimate={shouldAnimate}
            />
          )}
        </Reveal>

        {isSlider ? (
          <div className="mt-9 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 sm:mt-11 sm:gap-6">
            <p className="font-(--font-ui-family) text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]">
              {pad(activeIndex + 1)}
            </p>

            <div
              onPointerDown={handleRailPointerDown}
              className="relative h-11 rounded-full focus-within:ring-4 focus-within:ring-[rgba(47,111,159,0.42)]"
            >
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#a9cee4]/65"
              />
              <div
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#5c9fc6] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b9d9eb] bg-white/80 shadow-[0_4px_12px_rgba(75,136,176,0.18),inset_0_1px_0_white] backdrop-blur-xl transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{ left: `${progress}%` }}
              />
              <input
                type="range"
                min="0"
                max={sponsors.length - 1}
                step="1"
                value={activeIndex}
                aria-label={copy.goToLabel}
                onChange={(event) => scrollToIndex(Number(event.target.value))}
                className={`absolute inset-0 z-10 h-11 w-full cursor-pointer appearance-none opacity-0 disabled:cursor-default ${FOCUS_RING}`}
              />
            </div>

            <p
              aria-live="polite"
              className="font-(--font-ui-family) text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]"
            >
              {pad(sponsors.length)}
              <span className="sr-only"> {sponsors[activeIndex]?.name}</span>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
