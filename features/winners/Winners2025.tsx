import Image from "next/image";
import { Crown } from "lucide-react";
import { winnersByYear } from "./data";
import type { WinnersCopy } from "./copy";
import styles from "./Winners2025.module.css";

export default function Winners2025({ c }: { c: WinnersCopy }) {
  const winners = winnersByYear[2025];
  return (
    <section id="winners-2025" className={styles.archive} aria-labelledby="edition-2025-title">
      <div className={styles.intro} data-archive-intro>
        <div><p className={styles.eyebrow}>{c.archive}</p><h2 id="edition-2025-title" aria-label="2025" data-archive-year><span className={styles.yearMask} aria-hidden="true"><span data-archive-year-digit>2</span><span data-archive-year-digit>0</span><span data-archive-year-digit>2</span><span data-archive-year-digit>5</span><span data-archive-year-digit className={styles.yearDot}>.</span></span></h2></div>
        <div className={styles.introSide} data-archive-intro-copy><p>{c.archiveIntro}</p><span>{String(winners.length).padStart(2, "0")} / {c.archiveArtists}</span></div>
      </div>
      <div className={styles.carousel} data-archive-carousel>
        <div className={styles.track} data-archive-track>
          {winners.map((winner, index) => (
            <article key={winner.name} className={styles.card}>
              <div className={styles.photo}>
                <Image src={winner.image} alt={`${c.portrait} ${winner.name}`} fill sizes="(max-width: 600px) 78vw, 29vw" className={styles.image} />
                {winner.badge && <span className={styles.badge}><Crown size={13} aria-hidden="true" />{winner.badge}</span>}
              </div>
              <div className={styles.label}><span>{String(index + 1).padStart(2, "0")}</span><div className={styles.nameMask}><h3>{winner.name}</h3></div></div>
              <p className={styles.role}>{winner.category}</p>
            </article>
          ))}
        </div>
        <div className={styles.progress} aria-hidden="true">
          <span>IBPA / 2025</span>
          <div className={styles.progressLine}><span data-archive-progress /></div>
          <span data-archive-position>01 / {String(winners.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
