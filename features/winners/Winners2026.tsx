import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { winner2026AwardCount, winnerCategories2026 } from "./data2026";
import type { WinnersCopy } from "./copy";
import styles from "./Winners2026.module.css";

const artistCount = new Set(winnerCategories2026.flatMap((category) => category.winners.map((person) => person.name))).size;

export default function Winners2026({ c }: { c: WinnersCopy }) {
  return (
    <section id="winners-2026" className={styles.edition} aria-labelledby="edition-2026-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{c.edition}</p>
        <h2 id="edition-2026-title">{c.editionTitleOne}<br /><em>{c.editionTitleTwo}</em></h2>
        <p>{c.editionIntro}</p>
        <div className={styles.stats} aria-label={c.edition}>
          <span><strong>{String(winnerCategories2026.length).padStart(2, "0")}</strong>{c.categories}</span>
          <span><strong>{String(winner2026AwardCount).padStart(2, "0")}</strong>{c.awards}</span>
          <span><strong>{String(artistCount).padStart(2, "0")}</strong>{c.artists}</span>
        </div>
      </div>

      <div className={styles.categories}>
        {winnerCategories2026.map((category, categoryIndex) => (
          <section id={`winner-category-${categoryIndex}`} key={category.title} className={styles.category} aria-labelledby={`category-${categoryIndex}`} data-category>
            <div className={styles.stage} data-category-stage>
              <span className={styles.backgroundWord} data-category-word aria-hidden="true">{category.title}</span>
              <div className={styles.categoryHeader}>
                <p className={styles.categoryLabel}>{c.category} / {String(categoryIndex + 1).padStart(2, "0")}</p>
                <h3 id={`category-${categoryIndex}`} data-category-title>{category.title}</h3>
                <p className={styles.categoryCount}>{category.winners.reduce((sum, person) => sum + person.awards.length, 0).toString().padStart(2, "0")} {c.honours}</p>
              </div>
              <div className={styles.panels}>
                {category.winners.map((person, personIndex) => (
                  <article className={styles.spotlight} key={person.name} data-spotlight>
                    <div className={styles.portraitShell} data-spotlight-photo>
                      {person.image ? (
                        <Image src={person.image} alt={`${c.portrait} ${person.name}`} fill sizes="(max-width: 1023px) 90vw, 42vw" className={styles.portrait} />
                      ) : (
                        <div className={styles.placeholder} role="img" aria-label={`${person.name}: ${c.initials}`}><span>YT</span><small>{c.initials}</small></div>
                      )}
                      <span className={styles.portraitIndex} aria-hidden="true">{String(personIndex + 1).padStart(2, "0")} / {String(category.winners.length).padStart(2, "0")}</span>
                    </div>
                    <div className={styles.personCopy} data-spotlight-copy>
                      <p className={styles.winnerLabel}>{c.winner} / 2026</p>
                      <div className={styles.nameMask}><h4 data-spotlight-name>{person.name}</h4></div>
                      <p className={styles.awardsLabel}>{person.awards.length > 1 ? c.awards : c.award}</p>
                      <ul className={styles.awardsList} data-spotlight-awards>
                        {person.awards.map((award, awardIndex) => <li key={award}><span>{String(awardIndex + 1).padStart(2, "0")}</span>{award}</li>)}
                      </ul>
                      <a href={person.instagram} target="_blank" rel="noopener noreferrer" className={styles.instagram} aria-label={`${c.viewInstagram}: ${person.name}`}>{c.viewInstagram}<ArrowUpRight size={17} aria-hidden="true" /></a>
                    </div>
                  </article>
                ))}
              </div>
              <div className={styles.stageFooter} aria-hidden="true"><span>IBPA Beauty Awards</span><span>2026</span></div>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
