"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Crown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { winnerYears, winnersByYear } from "./data";
import styles from "./WinnersGallery.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const copy = {
  en: { eyebrow: "The IBPA archive", title: "The names behind the moment.", intro: "A celebration of the artists whose craft, vision and dedication left a mark on the 2025 forum.", explore: "Explore the winners", edition: "The 2025 edition", people: "Honoured artists", back: "Back to the forum", portrait: "Portrait of" },
  ru: { eyebrow: "Архив IBPA", title: "Имена, создающие момент.", intro: "Знакомьтесь с мастерами, чьи талант, видение и преданность делу запомнились на форуме 2025 года.", explore: "Смотреть победителей", edition: "Форум 2025", people: "Отмеченные мастера", back: "На главную", portrait: "Портрет" },
  ua: { eyebrow: "Архів IBPA", title: "Імена, що творять момент.", intro: "Знайомтеся з майстрами, чия майстерність, бачення й відданість справі запам’яталися на форумі 2025 року.", explore: "Дивитися переможців", edition: "Форум 2025", people: "Відзначені майстри", back: "На головну", portrait: "Портрет" },
} as const;

export default function WinnersGallery() {
  const { language } = useLanguage();
  const c = copy[language];
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo("[data-hero-reveal]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.11, ease: "power3.out", clearProps: "all" });

      const cards = gsap.utils.toArray<HTMLElement>("[data-winner-reveal]");
      cards.forEach((card, index) => {
        const photo = card.querySelector<HTMLElement>("[data-winner-photo]");
        const image = card.querySelector<HTMLElement>("[data-winner-image]");
        const title = card.querySelector<HTMLElement>("[data-winner-title]");
        const detail = card.querySelector<HTMLElement>("[data-winner-detail]");
        if (!photo || !image || !title || !detail) return;

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: card,
            start: () => `top ${92 - (index % 3) * 4}%`,
            end: () => `top ${42 - (index % 3) * 4}%`,
            scrub: 0.45,
            invalidateOnRefresh: true,
          },
        });
        timeline
          .fromTo(photo, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.75 }, 0)
          .fromTo(image, { scale: 1.09, yPercent: -3 }, { scale: 1, yPercent: 0, duration: 1 }, 0)
          .fromTo(title, { yPercent: 105 }, { yPercent: 0, duration: 0.42 }, 0.4)
          .fromTo(detail, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.58);
      });
    });
    return () => motion.revert();
  }, { scope: root });

  return (
    <div ref={root} className={styles.page}>
      <section className={styles.hero} aria-labelledby="winners-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p data-hero-reveal className={styles.eyebrow}><span className={styles.eyebrowLine} />{c.eyebrow} / {winnerYears[0]}</p>
            <h1 data-hero-reveal id="winners-title" className={styles.title}>{c.title}</h1>
            <p data-hero-reveal className={styles.intro}>{c.intro}</p>
            <a data-hero-reveal href="#archive" className={styles.explore}>{c.explore}<ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <div data-hero-reveal className={styles.heroArtwork} aria-hidden="true">
            <div className={styles.heroHalo} />
            <div className={styles.heroPortrait}><Image src={winnersByYear[winnerYears[0]][0].image} alt="" fill priority sizes="(max-width: 900px) 75vw, 440px" className={styles.image} /></div>
            <div className={styles.heroYear}>{winnerYears[0]}</div>
            <div className={styles.heroSeal}>IBPA<br />AWARDS</div>
          </div>
        </div>
        <span className={styles.heroRule} aria-hidden="true" />
      </section>

      <div id="archive" className={styles.archive}>
        {winnerYears.map((year) => (
          <section key={year} className={styles.edition} aria-labelledby={`winners-${year}`}>
            <div className={styles.editionHead}>
              <div><p className={styles.eyebrow}>{c.edition}</p><h2 id={`winners-${year}`} className={styles.editionTitle}>{year}<span className={styles.period}>.</span></h2></div>
              <p className={styles.count}>{winnersByYear[year].length.toString().padStart(2, "0")} / {c.people}</p>
            </div>
            <div className={styles.grid}>
              {winnersByYear[year].map((winner, index) => (
                <article key={winner.name} data-winner-reveal className={styles.card}>
                  <div data-winner-photo className={styles.photo}>
                    <Image data-winner-image src={winner.image} alt={`${c.portrait} ${winner.name}`} fill sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 30vw" className={styles.image} />
                    <span className={styles.photoShade} />
                    {winner.badge && <span className={styles.badge}><Crown size={14} aria-hidden="true" />{winner.badge}</span>}
                    <span className={styles.photoNumber}>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className={styles.cardText}><div className={styles.titleMask}><h3 data-winner-title>{winner.name}</h3></div><p data-winner-detail>{winner.category}</p></div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className={styles.closing}><span>IBPA / {winnerYears.join(" · ")}</span><Link href="/">{c.back}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </div>
  );
}
