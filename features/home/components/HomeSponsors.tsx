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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe, Handshake, Mail, MapPin } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/translations";
import { Reveal } from "@/shared/components/public";

type SponsorsCopy = Translations["home"]["sponsorsSection"];
type Sponsor = SponsorsCopy["sponsors"][number];
type Direction = 1 | -1;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(47,111,159,0.42)]";

const META_LABEL_CLASS =
  "font-[var(--font-ui-family)] text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#2f6f9f]";

const META_LINK_CLASS = `inline-flex min-h-11 max-w-full items-center gap-2 break-all rounded-full border border-[#b9d9eb]/65 bg-white/64 px-4 py-2 text-sm font-medium text-[#24394b] underline-offset-4 backdrop-blur-xl transition-colors hover:border-[#72a0c1]/65 hover:bg-white hover:text-[#2f6f9f] hover:underline ${FOCUS_RING}`;

const EASING = [0.22, 1, 0.36, 1] as const;

function SponsorStory({ sponsor, copy }: { sponsor: Sponsor; copy: SponsorsCopy }) {
  return (
    <article className="grid gap-9 py-1 sm:gap-10 md:grid-cols-[minmax(17rem,0.82fr)_minmax(0,1.35fr)] md:items-center md:gap-12 md:py-5 lg:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.45fr)] lg:gap-16">
      <div className="relative isolate self-start transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] translate-x-3 translate-y-3 rounded-[2rem] border border-[#b9d9eb]/42 bg-white/24 shadow-[0_16px_34px_rgba(114,160,193,0.08)] backdrop-blur-md"
        />
        <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-[2rem] border border-[#9fcae3]/68 bg-white/42 px-7 py-10 shadow-[0_20px_48px_rgba(83,145,184,0.15),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl sm:min-h-64 sm:px-10 sm:py-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-px h-px bg-white/95"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 left-px top-8 w-px bg-white/78"
          />
          <div className="relative h-24 w-full max-w-[18rem] sm:h-28">
            <Image
              src={sponsor.logo}
              alt={sponsor.logoAlt}
              fill
              sizes="(min-width: 1024px) 19rem, (min-width: 640px) 18rem, calc(100vw - 4rem)"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="font-[var(--font-display)] text-[clamp(2rem,3.25vw,3.35rem)] leading-[1.02] tracking-[-0.045em] text-[#10182a]">
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
  const sponsorButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const touchState = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    horizontal: false,
    didSwipe: false,
  });
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

  const handleSponsorKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + offset + sponsors.length) % sponsors.length;
    sponsorButtonRefs.current[nextIndex]?.focus();
    selectSponsor(nextIndex);
  };

  const handleContentPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "touch" ||
      !window.matchMedia("(max-width: 767px)").matches ||
      !isSwitcher ||
      isTransitioning
    ) {
      return;
    }

    touchState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      horizontal: false,
      didSwipe: false,
    };
  };

  const handleContentPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const touch = touchState.current;
    if (touch.pointerId !== event.pointerId) return;

    const distanceX = event.clientX - touch.startX;
    const distanceY = event.clientY - touch.startY;

    if (!touch.horizontal) {
      if (Math.abs(distanceY) > Math.abs(distanceX) && Math.abs(distanceY) > 8) {
        touchState.current.pointerId = -1;
        return;
      }
      if (Math.abs(distanceX) < 8) return;

      touch.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    touch.didSwipe = true;
  };

  const handleContentPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const touch = touchState.current;
    if (touch.pointerId !== event.pointerId) return;

    const distanceX = event.clientX - touch.startX;
    const shouldSwitch = touch.horizontal && Math.abs(distanceX) >= 48;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    touchState.current.pointerId = -1;
    if (shouldSwitch) {
      const nextIndex = Math.max(
        0,
        Math.min(
          sponsors.length - 1,
          activeIndex + (distanceX < 0 ? 1 : -1),
        ),
      );
      selectSponsor(nextIndex);
    }

    if (touch.didSwipe) {
      window.setTimeout(() => {
        touchState.current.didSwipe = false;
      }, 120);
    }
  };

  const suppressSwipedLink = (event: MouseEvent<HTMLDivElement>) => {
    if (!touchState.current.didSwipe) return;
    event.preventDefault();
    event.stopPropagation();
  };

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

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-3xl">
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
            onPointerDown={handleContentPointerDown}
            onPointerMove={handleContentPointerMove}
            onPointerUp={handleContentPointerEnd}
            onPointerCancel={handleContentPointerEnd}
            onClickCapture={suppressSwipedLink}
            className="relative grid min-h-[46rem] overflow-hidden [touch-action:pan-y] sm:min-h-[41rem] md:min-h-[31rem]"
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
                className="col-start-1 row-start-1"
              >
                <SponsorStory sponsor={sponsors[activeIndex]} copy={copy} />
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {isSwitcher ? (
          <div
            role="tablist"
            aria-label={copy.sliderLabel}
            className="mt-7 min-w-0 overflow-x-auto [scrollbar-width:none] sm:mt-9 [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex w-max min-w-full border-b border-[#b9d9eb]/65">
              {sponsors.map((sponsor, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={sponsor.id}
                    ref={(element) => {
                      sponsorButtonRefs.current[index] = element;
                    }}
                    type="button"
                    role="tab"
                    tabIndex={isActive ? 0 : -1}
                    aria-selected={isActive}
                    aria-controls="sponsor-content"
                    disabled={isTransitioning}
                    onClick={() => selectSponsor(index)}
                    onKeyDown={(event) => handleSponsorKeyDown(event, index)}
                    className={`relative isolate shrink-0 px-4 pb-3 pt-1 font-[var(--font-ui-family)] text-sm font-semibold transition-colors sm:px-5 ${FOCUS_RING} ${
                      isActive
                        ? "cursor-default text-[#17374d]"
                        : "text-[#7890a2] hover:text-[#385d76] disabled:cursor-wait"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="active-sponsor-underline"
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-3 bottom-[-1px] z-10 h-0.5 rounded-full bg-[#5c9fc6] sm:inset-x-4"
                        transition={{ duration: reducedMotion ? 0.16 : 0.45, ease: EASING }}
                      />
                    ) : null}
                    {isActive ? (
                      <motion.span
                        layoutId="active-sponsor-indicator"
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-[-3px] left-1/2 z-10 size-1.5 -translate-x-1/2 rounded-full bg-[#2f6f9f]"
                        transition={{ duration: reducedMotion ? 0.16 : 0.45, ease: EASING }}
                      />
                    ) : null}
                    {sponsor.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
