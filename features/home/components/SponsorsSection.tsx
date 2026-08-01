"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Globe, Handshake, Mail, MapPin } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/translations";
import {
  ButtonLayers,
  LANDING_PRIMARY_BTN_CLASS,
  Reveal,
} from "@/shared/components/public";

type SponsorsCopy = Translations["home"]["sponsorsSection"];
type Sponsor = SponsorsCopy["sponsors"][number];

// Intrinsic size of the supplied FORMULA artboard — passed to <Image> so the
// logo reserves its box before the SVG loads.
const LOGO_WIDTH = 3010;
const LOGO_HEIGHT = 1158;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(47,111,159,0.45)]";

const META_LABEL_CLASS =
  "font-(--font-ui-family) text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#2f6f9f]";

const META_LINK_CLASS = `inline-flex min-h-11 max-w-full items-center gap-2 break-all rounded-full border border-[#b9d9eb]/65 bg-white/72 px-4 py-2 text-sm font-medium text-[#24394b] underline-offset-4 backdrop-blur-xl transition hover:border-[#72a0c1]/60 hover:bg-white hover:text-[#2f6f9f] hover:underline ${FOCUS_RING}`;

const NAV_BUTTON_CLASS = `flex size-12 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#10182a] backdrop-blur-xl transition hover:border-[#72a0c1]/50 hover:bg-white disabled:cursor-not-allowed disabled:border-[#b9d9eb]/30 disabled:bg-white/35 disabled:text-[#10182a]/28 disabled:hover:border-[#b9d9eb]/30 disabled:hover:bg-white/35 ${FOCUS_RING}`;

const pad = (value: number) => String(value).padStart(2, "0");

// ─── SponsorCard ──────────────────────────────────────────────────────────────
// One reusable card for every sponsor. The editorial marker and the oversized
// outlined numeral are derived from the index, so adding a sponsor needs only
// translated data plus a logo.

function SponsorCard({
  sponsor,
  index,
  copy,
}: {
  sponsor: Sponsor;
  index: number;
  copy: SponsorsCopy;
}) {
  const marker = pad(index + 1);

  return (
    <article className="relative h-full overflow-hidden rounded-[2.4rem] border border-[#b9d9eb]/60 bg-white/62 p-5 shadow-[0_24px_70px_rgba(114,160,193,0.14)] backdrop-blur-xl transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#72a0c1]/55 hover:shadow-[0_32px_88px_rgba(114,160,193,0.22)] sm:p-8 lg:p-10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />

      {/* Oversized outlined index — decorative, sits behind the panels. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 left-0 select-none font-(--font-display) text-[8rem] leading-none text-transparent [-webkit-text-stroke:1px_rgba(114,160,193,0.4)] sm:-bottom-12 sm:text-[12rem] lg:-bottom-16 lg:text-[16rem]"
      >
        {marker}
      </span>

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-center lg:gap-0">
        {/* ── Logo panel: pale-blue glass over two staggered white layers ── */}
        <div className="relative z-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-2 -translate-y-2 rounded-[2rem] border border-[#b9d9eb]/45 bg-white/45 sm:-translate-x-3 sm:-translate-y-3"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-[2rem] border border-[#b9d9eb]/35 bg-white/30 sm:translate-x-3 sm:translate-y-3"
          />

          <div className="relative flex items-center justify-center rounded-[2rem] border border-[#b9d9eb]/70 bg-[linear-gradient(150deg,rgba(216,236,248,0.92),rgba(255,255,255,0.72))] px-8 py-12 shadow-[0_18px_46px_rgba(114,160,193,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:px-10 sm:py-14">
            <Image
              src={sponsor.logo}
              alt={sponsor.logoAlt}
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              className="h-auto w-full max-w-[17rem]"
            />
          </div>
        </div>

        {/* ── Information panel: tucked under the logo panel on desktop ── */}
        <div className="relative z-10 rounded-[2rem] border border-[#b9d9eb]/55 bg-white/64 p-5 shadow-[0_14px_40px_rgba(114,160,193,0.1)] backdrop-blur-xl sm:p-7 lg:-ml-20 lg:py-10 lg:pl-32 lg:pr-10">
          <p className="flex flex-wrap items-center gap-3 font-(--font-ui-family) text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]">
            <span>
              {marker} / {copy.markerLabel}
            </span>

            {sponsor.label ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b9d9eb]/70 bg-white/72 px-3 py-1.5">
                <Handshake className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {sponsor.label}
              </span>
            ) : null}
          </p>

          <h3 className="mt-4 font-(--font-display) text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.04em] text-[#10182a]">
            {sponsor.name}
          </h3>

          <p className="page-copy mt-4 max-w-2xl">{sponsor.description}</p>

          <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className={META_LABEL_CLASS}>{copy.metaLocation}</dt>
              <dd className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#24394b]">
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

          {sponsor.website ? (
            <a
              href={sponsor.website}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${copy.visitWebsite} — ${sponsor.name}`}
              className={`${LANDING_PRIMARY_BTN_CLASS} ${FOCUS_RING} mt-7`}
            >
              <ButtonLayers />
              <span className="relative z-10">{copy.visitWebsite}</span>
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="relative z-10 text-[#72a0c1] transition-all duration-500 group-hover:translate-x-1.5 group-hover:scale-110"
              />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ─── SponsorsSection ──────────────────────────────────────────────────────────

export default function SponsorsSection() {
  const { t } = useLanguage();
  const copy = t.home.sponsorsSection;
  const sponsors = copy.sponsors;

  const reducedMotion = useReducedMotion();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // A single sponsor renders as a plain card — no controls, no dots and no
  // misleading swipe affordance.
  const isSlider = sponsors.length > 1;

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

    setActiveIndex(clampIndex(Math.round(slider.scrollLeft / step)));
  };

  const scrollToIndex = (index: number) => {
    const slider = sliderRef.current;
    const step = getStep();
    if (!slider || !step) return;

    slider.scrollTo({
      left: clampIndex(index) * step,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Only when the track itself has focus — arrow keys inside a card's links
    // must keep their default behaviour.
    if (event.target !== event.currentTarget) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  };

  const cards = sponsors.map((sponsor, index) => (
    <SponsorCard key={sponsor.id} sponsor={sponsor} index={index} copy={copy} />
  ));

  return (
    <section
      id="sponsors"
      aria-labelledby="sponsors-heading"
      className="relative overflow-hidden bg-[linear-gradient(190deg,#ffffff_0%,#f0f7fb_46%,#e7f1f8_100%)] py-20 md:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-12%] top-[-16%] h-80 w-80 rounded-full bg-[#b9d9eb]/30 blur-3xl md:h-[460px] md:w-[460px]" />
        <div className="absolute bottom-[-18%] left-[-12%] h-80 w-80 rounded-full bg-[#72a8d4]/12 blur-3xl md:h-[480px] md:w-[480px]" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2 font-(--font-ui-family) text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f] backdrop-blur-xl">
                <Handshake className="h-4 w-4" aria-hidden="true" />
                {copy.eyebrow}
              </div>

              <h2
                id="sponsors-heading"
                className="text-balance font-(--font-display) text-[clamp(2.5rem,5vw,5.4rem)] leading-[0.95] tracking-[-0.05em] text-[#10182a]"
              >
                {copy.title}
              </h2>

              <p className="page-copy mt-5 max-w-2xl">{copy.description}</p>
            </div>

            {isSlider ? (
              <div className="hidden items-center gap-3 md:flex">
                <button
                  type="button"
                  aria-label={copy.prevLabel}
                  disabled={activeIndex === 0}
                  onClick={() => scrollToIndex(activeIndex - 1)}
                  className={NAV_BUTTON_CLASS}
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  aria-label={copy.nextLabel}
                  disabled={activeIndex === sponsors.length - 1}
                  onClick={() => scrollToIndex(activeIndex + 1)}
                  className={NAV_BUTTON_CLASS}
                >
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 md:mt-14">
          {isSlider ? (
            <div
              ref={sliderRef}
              role="group"
              aria-label={copy.sliderLabel}
              tabIndex={0}
              onScroll={updateActiveIndex}
              onKeyDown={handleKeyDown}
              className={`flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth rounded-[2.4rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${FOCUS_RING}`}
            >
              {sponsors.map((sponsor, index) => (
                <div
                  key={sponsor.id}
                  data-sponsor-slide
                  className="w-full shrink-0 snap-start"
                >
                  {cards[index]}
                </div>
              ))}
            </div>
          ) : (
            cards
          )}
        </Reveal>

        {isSlider ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              {sponsors.map((sponsor, index) => (
                <button
                  key={sponsor.id}
                  type="button"
                  aria-label={`${copy.goToLabel} ${index + 1}`}
                  aria-current={activeIndex === index}
                  onClick={() => scrollToIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${FOCUS_RING} ${
                    activeIndex === index
                      ? "w-8 bg-[#2f6f9f]"
                      : "w-3 bg-[#72a0c1]/35 hover:bg-[#72a0c1]/60"
                  }`}
                />
              ))}
            </div>

            <p
              aria-live="polite"
              className="font-(--font-ui-family) text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f]"
            >
              {pad(activeIndex + 1)} / {pad(sponsors.length)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
