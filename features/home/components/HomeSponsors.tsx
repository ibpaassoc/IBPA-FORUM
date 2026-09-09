"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe, Handshake, Mail, MapPin } from "lucide-react";
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
};
type Direction = 1 | -1;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(47,111,159,0.42)]";
const EASING = [0.22, 1, 0.36, 1] as const;

function SponsorContacts({ sponsor, copy }: { sponsor: Sponsor; copy: SponsorsCopy }) {
  const contacts = [
    sponsor.location
      ? { label: copy.metaLocation, value: sponsor.location, icon: <MapPin className="size-3.5 shrink-0" aria-hidden="true" /> }
      : null,
    sponsor.website
      ? { label: copy.metaWebsite, value: sponsor.websiteLabel ?? sponsor.website, href: sponsor.website, icon: <Globe className="size-3.5 shrink-0" aria-hidden="true" /> }
      : null,
    sponsor.instagram
      ? { label: copy.metaInstagram, value: sponsor.instagramLabel ?? sponsor.instagram, href: sponsor.instagram, icon: <FaInstagram className="size-3.5 shrink-0" aria-hidden="true" /> }
      : null,
    sponsor.email
      ? { label: copy.metaEmail, value: sponsor.email, href: `mailto:${sponsor.email}`, icon: <Mail className="size-3.5 shrink-0" aria-hidden="true" /> }
      : null,
  ].filter((contact): contact is NonNullable<typeof contact> => Boolean(contact));

  if (!contacts.length) return null;

  return (
    <dl className="mt-6 flex flex-wrap gap-2.5">
      {contacts.map((contact) => (
        <div key={`${contact.label}-${contact.value}`}>
          <dt className="sr-only">{contact.label}</dt>
          <dd>
            {contact.href ? (
              <a
                href={contact.href}
                target={contact.href.startsWith("http") ? "_blank" : undefined}
                rel={contact.href.startsWith("http") ? "noreferrer noopener" : undefined}
                className={`inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-[#b9d9eb]/70 bg-white/72 px-3.5 py-2 text-xs font-medium text-[#294358] transition-colors hover:border-[#72a0c1]/70 hover:bg-white hover:text-[#2f6f9f] ${FOCUS_RING}`}
              >
                {contact.icon}
                <span className="max-w-[11rem] truncate">{contact.value}</span>
              </a>
            ) : (
              <span className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/54 px-3.5 py-2 text-xs font-medium text-[#294358]">
                {contact.icon}
                <span className="max-w-[11rem] truncate">{contact.value}</span>
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SponsorSlide({ sponsor, copy }: { sponsor: Sponsor; copy: SponsorsCopy }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <article className="grid overflow-hidden rounded-[2rem] border border-[#b9d9eb]/72 bg-white/58 shadow-[0_24px_70px_rgba(83,145,184,0.13),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl md:h-[33rem] md:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)]">
      <div className="relative isolate min-h-[19rem] overflow-hidden bg-[radial-gradient(circle_at_22%_22%,#ffffff_0%,#e6f3fa_36%,#b9d9eb_100%)] md:min-h-0">
        {sponsor.featureImage ? (
          <Image src={sponsor.featureImage} alt={sponsor.featureImageAlt ?? sponsor.logoAlt} fill sizes="(max-width: 767px) calc(100vw - 2rem), (min-width: 768px) 42vw, 48vw" className="object-cover" />
        ) : null}
        <div aria-hidden="true" className={`absolute inset-0 ${sponsor.featureImage ? "bg-[linear-gradient(135deg,rgba(13,28,45,0.18),rgba(114,160,193,0.18)_45%,rgba(242,248,251,0.48))]" : "bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(185,217,235,0.3))]"}`} />
        <span aria-hidden="true" className="absolute left-8 top-8 size-24 rounded-full border border-white/54 bg-white/16 blur-[1px]" />
        <span aria-hidden="true" className="absolute bottom-[-3rem] right-[-2rem] size-48 rounded-full border border-white/36 bg-[#72a0c1]/12" />

        <div className="absolute inset-5 grid place-items-center rounded-[1.5rem] border border-white/58 bg-white/12 p-5 backdrop-blur-[2px] sm:inset-7 sm:p-7">
          <span className="absolute left-5 top-5 w-fit rounded-full border border-white/58 bg-white/56 px-3 py-1.5 font-[var(--font-ui-family)] text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2f6f9f] backdrop-blur-xl sm:left-7 sm:top-7">
            {copy.eyebrow}
          </span>
          <div className="flex h-28 w-full max-w-[22rem] items-center justify-center rounded-[1.35rem] border border-white/80 bg-white/88 px-7 py-5 shadow-[0_16px_42px_rgba(19,61,87,0.16)] backdrop-blur-xl sm:h-32 sm:px-10">
            {logoFailed ? (
              <span className="text-center font-[var(--font-display)] text-[clamp(1.25rem,3vw,2rem)] leading-none tracking-[-0.04em] text-[#10182a]">
                {sponsor.name}
              </span>
            ) : (
              <div className="relative h-full w-full">
                <Image src={sponsor.logo} alt={sponsor.logoAlt} fill sizes="(max-width: 767px) min(100vw - 5rem, 18rem), 22rem" className="object-contain" onError={() => setLogoFailed(true)} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col p-6 sm:p-8 md:min-h-0 md:p-9 lg:p-11">
        <p className="font-[var(--font-ui-family)] text-[0.67rem] font-semibold uppercase tracking-[0.2em] text-[#4b84ab]">{sponsor.label}</p>
        <h3 className="mt-3 text-balance font-[var(--font-display)] text-[clamp(2.35rem,4.2vw,4.45rem)] leading-[0.94] tracking-[-0.055em] text-[#10182a]">{sponsor.name}</h3>
        <div aria-hidden="true" className="mt-6 h-px w-16 bg-[#72a0c1]/65" />
        <div className="mt-5 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-4 md:[scrollbar-color:rgba(92,159,198,0.55)_transparent] md:[scrollbar-width:thin]">
          <p className="max-w-2xl whitespace-pre-line text-[0.96rem] leading-7 text-[#52636d] sm:text-[1rem]">{sponsor.description}</p>
        </div>
        <SponsorContacts sponsor={sponsor} copy={copy} />
      </div>
    </article>
  );
}

export default function HomeSponsors() {
  const { t } = useLanguage();
  const copy = t.home.sponsorsSection;
  const sponsors = copy.sponsors as readonly Sponsor[];
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [isPaused, setIsPaused] = useState(false);

  const safeIndex = Math.max(0, Math.min(activeIndex, sponsors.length - 1));
  const activeSponsor = sponsors[safeIndex];

  useEffect(() => {
    if (reducedMotion || isPaused || sponsors.length < 2) return;
    const timer = window.setTimeout(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % sponsors.length);
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, reducedMotion, sponsors.length]);

  if (!activeSponsor) return null;

  const selectSponsor = (index: number) => {
    if (index === safeIndex) return;
    setDirection(index > safeIndex ? 1 : -1);
    setActiveIndex(index);
  };
  const slideVariants = {
    enter: (slideDirection: Direction) => reducedMotion ? { opacity: 0 } : { opacity: 0, x: slideDirection * 52, scale: 0.988 },
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (slideDirection: Direction) => reducedMotion ? { opacity: 0 } : { opacity: 0, x: slideDirection * -36, scale: 0.992 },
  };

  return (
    <section id="sponsors" aria-labelledby="sponsors-heading" className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f5fafe_52%,#eef7fc_100%)] py-20 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[18%] size-72 rounded-full bg-[#d5ecf8]/44 blur-3xl md:size-[30rem]" />
        <div className="absolute bottom-[-20%] right-[-10%] size-72 rounded-full bg-[#b9d9eb]/24 blur-3xl md:size-[32rem]" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 py-2 font-[var(--font-ui-family)] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2f6f9f] backdrop-blur-xl">
              <Handshake className="size-4" aria-hidden="true" />
              {copy.eyebrow}
            </div>
            <h2 id="sponsors-heading" className="text-balance font-[var(--font-display)] text-[clamp(2.65rem,5.2vw,5.6rem)] leading-[0.94] tracking-[-0.055em] text-[#10182a]">{copy.title}</h2>
          </div>
        </Reveal>
      </div>

      <div className="relative mt-10 px-[clamp(1rem,3.25vw,4.5rem)] md:mt-14" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocusCapture={() => setIsPaused(true)} onBlurCapture={() => setIsPaused(false)}>
        <Reveal delay={0.08}>
          <div id="sponsor-content" role="region" aria-label={copy.sliderLabel} aria-live="polite">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div key={activeSponsor.id} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: reducedMotion ? 0.12 : 0.52, ease: EASING }}>
                <SponsorSlide sponsor={activeSponsor} copy={copy} />
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {sponsors.length > 1 ? (
          <Reveal delay={0.12} className="mt-6 md:mt-8">
            <nav aria-label={copy.sliderLabel} className="flex justify-center">
              <div className="max-w-full overflow-x-auto pb-1 [scrollbar-color:rgba(92,159,198,0.5)_transparent] [scrollbar-width:thin]">
                <ul className="flex min-w-full w-max items-center justify-center gap-2.5 px-1 md:gap-3">
                  {sponsors.map((sponsor, index) => {
                    const isActive = index === safeIndex;
                    return (
                      <li key={sponsor.id}>
                        <button type="button" aria-label={`${copy.goToLabel}: ${sponsor.name}`} aria-pressed={isActive} onClick={() => selectSponsor(index)} className={`group relative flex h-14 w-[6.15rem] items-center justify-center rounded-2xl border px-3 transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 active:translate-y-0 md:w-[6.6rem] ${FOCUS_RING} ${isActive ? "border-[#72a0c1]/75 bg-white shadow-[0_10px_26px_rgba(114,160,193,0.16)]" : "border-[#b9d9eb]/58 bg-white/46 hover:border-[#9fc7df]/80 hover:bg-white/82"}`}>
                          <span className="relative h-7 w-full max-w-[5.4rem]">
                            <Image src={sponsor.logo} alt="" fill sizes="6.6rem" className={`object-contain transition-opacity ${isActive ? "opacity-100" : "opacity-58 group-hover:opacity-90"}`} />
                          </span>
                          {isActive ? <span aria-hidden="true" className="absolute inset-x-5 bottom-1.5 h-0.5 rounded-full bg-[#5c9fc6]" /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
