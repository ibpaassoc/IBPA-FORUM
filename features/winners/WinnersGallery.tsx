"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import WinnersHero from "./WinnersHero";
import WinnersTopicNav from "./WinnersTopicNav";
import Winners2026 from "./Winners2026";
import Winners2025 from "./Winners2025";
import { useWinnersMotion } from "./useWinnersMotion";
import { winnersCopy } from "./copy";
import styles from "./WinnersGallery.module.css";

export default function WinnersGallery() {
  const { language } = useLanguage();
  const c = winnersCopy[language];
  const root = useRef<HTMLDivElement>(null);
  useWinnersMotion(root);

  return (
    <div ref={root} className={styles.page}>
      <WinnersHero c={c} />
      <WinnersTopicNav c={c} />
      <Winners2026 c={c} />
      <Winners2025 c={c} />
      <div className={styles.closing}>
        <span>IBPA Beauty Awards / 2026 · 2025</span>
        <Link href="/">{c.back}<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
