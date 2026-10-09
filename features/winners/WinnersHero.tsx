import Image from "next/image";
import { ArrowDownRight } from "lucide-react";
import type { WinnersCopy } from "./copy";
import styles from "./WinnersHero.module.css";

export default function WinnersHero({ c }: { c: WinnersCopy }) {
  return (
    <section className={styles.hero} aria-labelledby="winners-title" data-winners-hero>
      <div className={styles.imageWrap} data-hero-image>
        <Image src="/images/events/DSC00452.jpg" alt="" fill priority sizes="100vw" className={styles.image} />
        <div className={styles.scrim} />
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}><span data-hero-line>{c.heroEyebrow}</span></p>
        <h1 id="winners-title" className={styles.title}><span data-hero-line>{c.heroTitle}</span></h1>
        <div className={styles.yearMask}><span data-hero-line className={styles.year}>2026</span></div>
        <p className={styles.intro} data-hero-intro>{c.heroIntro}</p>
        <a className={styles.explore} href="#winners-2026" data-hero-intro>{c.explore}<ArrowDownRight size={18} aria-hidden="true" /></a>
      </div>
      <div className={styles.bottom}>
        <span>IBPA / 2026</span>
        <span className={styles.scroll}>{c.scroll}<span className={styles.scrollLine} aria-hidden="true" /></span>
        <a href="#winners-2025">{c.archiveLink}<ArrowDownRight size={14} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
