"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe, Handshake, Mail, MapPin } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/translations";
import { Reveal } from "@/shared/components/public";

type SponsorsCopy = Translations["home"]["sponsorsSection"];
type Sponsor = {
  id: string;
  name: string;
  label: string;
  logo: string;
  logoAlt: string;
  description: string;
  location?: string;
  website?: string;
  websiteLabel?: string;
  instagram?: string;
  instagramLabel?: string;
  email?: string;
  featureImage?: string;
  featureImageAlt?: string;
  // Badge/emblem logos (square, not a wide wordmark) need a larger, squarer
  // render box so they don't read as a tiny mark next to the wordmarks.
  logoBadge?: boolean;
};
type Direction = 1 | -1;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(47,111,159,0.42)]";

const META_LABEL_CLASS =
  "font-[var(--font-ui-family)] text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#2f6f9f]";

const META_LINK_CLASS = `inline-flex min-h-11 max-w-full items-center gap-2 break-all rounded-full border border-[#b9d9eb]/65 bg-white/64 px-4 py-2 text-sm font-medium text-[#24394b] underline-offset-4 backdrop-blur-xl transition-colors hover:border-[#72a0c1]/65 hover:bg-white hover:text-[#2f6f9f] hover:underline ${FOCUS_RING}`;

const EASING = [0.22, 1, 0.36, 1] as const;

function SponsorStory({ sponsor, copy }: { sponsor: Sponsor; copy: SponsorsCopy }) {
  return (
    <article className="grid gap-9 px-5 py-1 sm:gap-10 md:grid-cols-[minmax(17rem,0.82fr)_minmax(0,1.35fr)] md:px-0 md:py-5 md:items-center md:gap-12 lg:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.45fr)] lg:gap-16">
      <div className="relative isolate self-start transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] translate-x-3 translate-y-3 rounded-[2rem] border border-[#b9d9eb]/42 bg-white/24 shadow-[0_16px_34px_rgba(114,160,193,0.08)] backdrop-blur-md"
        />
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-[2rem] border border-[#9fcae3]/68 bg-white/42 shadow-[0_20px_48px_rgba(83,145,184,0.15),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl ${
            sponsor.featureImage
              ? "aspect-[4/5] min-h-0"
              : "min-h-56 px-7 py-10 sm:min-h-64 sm:px-10 sm:py-12"
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-px h-px bg-white/95"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 left-px top-8 w-px bg-white/78"
          />
          {sponsor.featureImage ? (
            <>
              <Image
                src={sponsor.featureImage}
                alt={sponsor.featureImageAlt ?? sponsor.logoAlt}
                fill
                sizes="(min-width: 1024px) 19rem, (min-width: 640px) 18rem, calc(100vw - 4rem)"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(16,24,42,0.42)_100%)]"
              />
              <div className="absolute inset-x-5 bottom-5 h-24 rounded-[1.35rem] border border-white/80 bg-white/92 px-5 py-3 shadow-xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:h-28">
                <div className="relative h-full w-full">
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.logoAlt}
                    fill
                    sizes="16rem"
                    className="object-contain"
                  />
                </div>
              </div>
            </>
          ) : (
            <div
              className={
                sponsor.logoBadge
                  ? "relative h-36 w-36 sm:h-44 sm:w-44"
                  : "relative h-24 w-full max-w-[18rem] sm:h-28"
              }
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.logoAlt}
                fill
                sizes="(min-width: 1024px) 19rem, (min-width: 640px) 18rem, calc(100vw - 4rem)"
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="font-[var(--font-display)] text-[clamp(2rem,3.25vw,3.35rem)] leading-[1.02] tracking-[-0.045em] text-[#10182a]">
          {sponsor.name}
        </h3>

        <p className="page-copy mt-4 max-w-2xl whitespace-pre-line text-pretty">
          {sponsor.description}
        </p>

        <dl className="mt-7 grid gap-x-7 gap-y-5 sm:grid-cols-2">
          {sponsor.location ? (
            <div>
              <dt className={META_LABEL_CLASS}>{copy.metaLocation}</dt>
              <dd className="mt-2 inline-flex min-h-11 max-w-full items-center gap-2 break-words text-sm font-medium text-[#24394b]">
                <MapPin className="h-4 w-4 shrink-0 text-[#72a0c1]" aria-hidden="true" />
                {sponsor.location}
              </dd>
            </div>
          ) : null}

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
      </div>
    </article>
  );
}

export default function HomeSponsors() {
  const { t } = useLanguage();
  const copy = t.home.sponsorsSection;
  const sponsors = copy.sponsors;
  const reducedMotion = useReducedMotion();
  const transitionTimerRef = useRef<number | null>(null);
  const [activeIndexState, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isSwitcher = sponsors.length > 1;
  const activeIndex = Math.max(0, Math.min(activeIndexState, sponsors.length - 1));

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  if (!sponsors.length) return null;

  const selectSponsor = (index: number) => {
    if (index === activeIndex || isTransitioning) return;

    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsTransitioning(true);

    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(
      () => setIsTransitioning(false),
      reducedMotion ? 0 : 580,
    );
  };

  const goPrev = () =>
    selectSponsor((activeIndex - 1 + sponsors.length) % sponsors.length);
  const goNext = () => selectSponsor((activeIndex + 1) % sponsors.length);

  // Duplicate the list so the auto-scrolling strip loops seamlessly; reduced-
  // motion users get a single, manually scrollable strip with no animation.
  const marqueeItems = reducedMotion ? sponsors : [...sponsors, ...sponsors];

  const storyVariants = {
    enter: (enterDirection: Direction) =>
      reducedMotion ? { opacity: 0 } : { opacity: 0, x: enterDirection * 52 },
    center: { opacity: 1, x: 0 },
    exit: (exitDirection: Direction) =>
      reducedMotion ? { opacity: 0 } : { opacity: 0, x: exitDirection * -28 },
  };

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

      <div className="page-section relative max-md:px-0">
        <Reveal>
          <div className="max-w-3xl max-md:px-5">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2 font-[var(--font-ui-family)] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f] backdrop-blur-xl">
              <Handshake className="h-4 w-4" aria-hidden="true" />
              {copy.eyebrow}
            </div>

            <h2
              id="sponsors-heading"
              className="text-balance font-[var(--font-display)] text-[clamp(2.65rem,5.2vw,5.6rem)] leading-[0.94] tracking-[-0.055em] text-[#10182a]"
            >
              {copy.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 md:mt-14">
          <div
            id="sponsor-content"
            role="region"
            aria-label={copy.sliderLabel}
            aria-live="polite"
            className="relative grid min-h-[32rem] overflow-visible md:h-[34rem] md:min-h-0 md:overflow-hidden"
          >
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={sponsors[activeIndex].id}
                custom={direction}
                variants={storyVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reducedMotion ? 0.16 : 0.54, ease: EASING }}
                className="col-start-1 row-start-1 h-auto overflow-visible md:h-full md:overflow-y-auto md:pr-1 md:[scrollbar-color:rgba(92,159,198,0.55)_transparent] md:[scrollbar-width:thin]"
              >
                <SponsorStory sponsor={sponsors[activeIndex]} copy={copy} />
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {isSwitcher ? (
          <Reveal delay={0.12} className="mt-8 md:mt-10">
            <div className="flex items-center gap-3 px-5 md:gap-4 md:px-0">
              <button
                type="button"
                aria-label={copy.prevLabel}
                onClick={goPrev}
                disabled={isTransitioning}
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/76 text-[#2f6f9f] shadow-sm transition hover:bg-white disabled:cursor-wait disabled:opacity-45 ${FOCUS_RING}`}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <div
                className={`relative min-w-0 flex-1 ${
                  reducedMotion
                    ? "overflow-x-auto"
                    : "overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]"
                }`}
              >
                <ul
                  aria-hidden="true"
                  className={`flex w-max items-center gap-3 py-1 md:gap-4 ${
                    reducedMotion
                      ? ""
                      : "animate-[marquee-left_40s_linear_infinite] hover:[animation-play-state:paused]"
                  }`}
                >
                  {marqueeItems.map((sponsor, i) => {
                    const index = i % sponsors.length;
                    const isActive = index === activeIndex;

                    return (
                      <li key={`${sponsor.id}-${i}`}>
                        <button
                          type="button"
                          tabIndex={-1}
                          title={sponsor.name}
                          onClick={() => selectSponsor(index)}
                          className={`group relative flex h-[4.75rem] w-[9.5rem] shrink-0 items-center justify-center rounded-2xl border px-4 transition-[border-color,background-color,box-shadow,transform] ${
                            isActive
                              ? "border-[#72a0c1]/70 bg-white/85 shadow-[0_8px_24px_rgba(114,160,193,0.14)]"
                              : "border-[#b9d9eb]/55 bg-white/45 hover:-translate-y-0.5 hover:border-[#9fc7df]/80 hover:bg-white/78"
                          }`}
                        >
                          <span
                            className={
                              sponsor.logoBadge
                                ? "relative h-14 w-14"
                                : "relative h-9 w-full max-w-[7.25rem]"
                            }
                          >
                            <Image
                              src={sponsor.logo}
                              alt=""
                              fill
                              sizes="9.5rem"
                              className={`object-contain transition-opacity ${isActive ? "opacity-100" : "opacity-55 group-hover:opacity-90"}`}
                            />
                          </span>
                          {isActive ? (
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-6 bottom-1.5 h-0.5 rounded-full bg-[#5c9fc6]"
                            />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                type="button"
                aria-label={copy.nextLabel}
                onClick={goNext}
                disabled={isTransitioning}
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/76 text-[#2f6f9f] shadow-sm transition hover:bg-white disabled:cursor-wait disabled:opacity-45 ${FOCUS_RING}`}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
