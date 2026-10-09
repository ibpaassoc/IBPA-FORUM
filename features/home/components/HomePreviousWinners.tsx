"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { featuredWinners2026 } from "@/features/winners/data2026";
import styles from "./HomePreviousWinners.module.css";

export default function PreviousWinnersSection() {
  const { t } = useLanguage();
  const c = t.home.previousWinners;

  return (
    <section className={styles.section} aria-labelledby="home-winners-title">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div><p className={styles.eyebrow}>{c.eyebrow}</p><h2 id="home-winners-title">{c.title}</h2></div>
          <span className={styles.year} aria-hidden="true">2026</span>
        </div>
        <div className={styles.grid}>
          {featuredWinners2026.map(({ winner, category, categoryIndex }, index) => (
            <Link href={`/winners#winner-category-${categoryIndex}`} key={winner.name} className={`${styles.card} ${index === 0 ? styles.featured : ""}`} aria-label={`${winner.name} — ${category}`}>
              <div className={styles.photo}>
                {winner.image && <Image src={winner.image} alt="" fill sizes={index === 0 ? "(max-width: 800px) 94vw, 40vw" : "(max-width: 800px) 45vw, 22vw"} className={styles.image} />}
                <div className={styles.photoShade} />
                <span className={styles.category}>{category}</span>
                <ArrowUpRight className={styles.arrow} size={20} aria-hidden="true" />
              </div>
              <div className={styles.cardCaption}><h3>{winner.name}</h3><span>{winner.awards[0]}</span></div>
            </Link>
          ))}
        </div>
        <Link href="/winners" className={styles.allLink}>{c.seeAll}<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
