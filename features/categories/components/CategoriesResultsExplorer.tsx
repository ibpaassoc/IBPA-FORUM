"use client";

import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowRight, Award, ChevronDown, ChevronRight, FileText, Gem,
  GraduationCap, HeartPulse, Medal, Palette, Scissors, Sparkles,
  Star, Store, Trophy, UsersRound,
} from "lucide-react";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { presentNominationCategories } from "@/features/applications/components/nomination-selection/nomination-presentation";
import type { PublicAwardResult } from "@/features/categories/server/public-results";
import { resultsCopy } from "./results-copy";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { translations } from "@/lib/i18n/translations";
import styles from "./CategoriesResultsExplorer.module.css";

gsap.registerPlugin(useGSAP);

const categoryIcons = {
  hair: Scissors, nail: Gem, brow: Sparkles, lash: Star,
  "makeup-artistry": Palette, "permanent-makeup": Award,
  education: GraduationCap, salon: Store, brand: Medal,
  "skin-cosmetology-facial": HeartPulse,
  "body-wellness-nutrition": UsersRound,
} as const;

export default function CategoriesResultsExplorer({
  categories,
  results,
}: {
  categories: CategoryOption[];
  results: PublicAwardResult[];
}) {
  const { language, t } = useLanguage();
  const copy = resultsCopy[language];
  const presented = useMemo(() => presentNominationCategories(
    categories,
    translations.en.categoriesPage.directions,
    t.categoriesPage.directions,
  ), [categories, t.categoriesPage.directions]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [awardId, setAwardId] = useState(categories[0]?.awards[0]?.id ?? "");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [awardOpen, setAwardOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeCategory = presented.find((item) => item.id === categoryId) ?? presented[0];
  const activeAward = activeCategory?.awards.find((item) => item.id === awardId) ?? activeCategory?.awards[0];
  const activeResults = results.filter((item) => item.awardId === activeAward?.id);

  useGSAP((_, contextSafe) => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const reveal = contextSafe!(() => {
      gsap.fromTo(root.querySelectorAll("[data-results-reveal]"),
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.72, stagger: 0.1, ease: "power2.out", clearProps: "all" },
      );
    });
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        reveal();
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(root);
    return () => observer.disconnect();
  }, { scope: rootRef });

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo("[data-result-entry]",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.38, stagger: 0.055, ease: "power2.out", clearProps: "all" },
    );
  }, { scope: resultsRef, dependencies: [activeAward?.id], revertOnUpdate: true });

  function chooseCategory(nextId: string) {
    const next = presented.find((item) => item.id === nextId);
    setCategoryId(nextId);
    setAwardId(next?.awards[0]?.id ?? "");
    setCategoryOpen(false);
    setAwardOpen(false);
  }

  return (
    <section id="results" ref={rootRef} className={styles.section} aria-labelledby="results-heading">
      <div className={styles.wrap}>
        <div className={styles.intro} data-results-reveal>
          <p className={styles.eyebrow}><span />{copy.eyebrow}</p>
          <h2 id="results-heading">{copy.title}</h2>
          <p className={styles.lede}>{copy.intro}</p>
        </div>

        <div className={styles.explorer}>
          <div className={`${styles.panel} ${styles.categoryPanel}`} data-results-reveal>
            <div className={styles.panelHeading}>
              <span className={styles.icon}><Gem size={20} strokeWidth={1.6} /></span>
              <div><span className={styles.step}>01 / {copy.category}</span><h3>{copy.chooseCategory}</h3></div>
              <button type="button" className={styles.mobileToggle} aria-label={copy.chooseCategory}
                aria-expanded={categoryOpen} aria-controls="results-categories"
                onClick={() => setCategoryOpen((value) => !value)}>
                <ChevronDown size={21} className={categoryOpen ? styles.rotated : ""} />
              </button>
            </div>
            <p className={styles.mobileSelection}>{activeCategory?.displayName ?? copy.chooseCategory}</p>
            <div id="results-categories" className={`${styles.collapsible} ${categoryOpen ? styles.open : ""}`}>
              <div className={styles.list}>
                {presented.map((category) => {
                  const Icon = categoryIcons[category.slug as keyof typeof categoryIcons] ?? Award;
                  return <button key={category.id} type="button" className={`${styles.option} ${category.id === activeCategory?.id ? styles.selected : ""}`}
                    aria-pressed={category.id === activeCategory?.id} onClick={() => chooseCategory(category.id)}>
                    <span className={styles.smallIcon}><Icon size={18} strokeWidth={1.7} /></span>
                    <span className={styles.optionText}>{category.displayName}</span>
                    <span className={styles.count}>{category.awards.length} <span>{copy.nominationsCount(category.awards.length)}</span></span>
                  </button>;
                })}
              </div>
            </div>
          </div>

          <div className={`${styles.panel} ${styles.nominationPanel}`} data-results-reveal>
            <div className={styles.panelHeading}>
              <span className={styles.icon}><FileText size={20} strokeWidth={1.6} /></span>
              <div><span className={styles.step}>02 / {copy.nomination}</span><h3>{copy.chooseNomination}</h3></div>
              <button type="button" className={styles.mobileToggle} aria-label={copy.chooseNomination}
                aria-expanded={awardOpen} aria-controls="results-nominations"
                onClick={() => setAwardOpen((value) => !value)}>
                <ChevronDown size={21} className={awardOpen ? styles.rotated : ""} />
              </button>
            </div>
            <p className={styles.mobileSelection}>{activeAward?.displayName ?? copy.chooseNomination}</p>
            <div id="results-nominations" className={`${styles.collapsible} ${awardOpen ? styles.open : ""}`}>
              <div className={styles.list}>
                {activeCategory?.awards.map((award) => {
                  const count = results.filter((item) => item.awardId === award.id).length;
                  return <button key={award.id} type="button" className={`${styles.awardOption} ${award.id === activeAward?.id ? styles.selected : ""}`}
                    aria-pressed={award.id === activeAward?.id} onClick={() => { setAwardId(award.id); setAwardOpen(false); }}>
                    <span><strong>{award.displayName}</strong><small>{count} {copy.applicantsCount(count)}</small></span>
                    <ChevronRight size={18} strokeWidth={1.7} />
                  </button>;
                })}
              </div>
            </div>
          </div>

          <div className={`${styles.panel} ${styles.resultsPanel}`} data-results-reveal ref={resultsRef}>
            <div className={styles.panelHeading}>
              <span className={styles.icon}><Trophy size={20} strokeWidth={1.6} /></span>
              <div><span className={styles.step}>03 / {copy.results}</span><h3>{activeCategory?.displayName ?? copy.results}</h3></div>
            </div>
            <div className={styles.resultFrame} aria-live="polite" aria-atomic="true">
              <div className={styles.resultTitle} data-result-entry>
                <p className={styles.resultKicker}>{copy.nomination}</p>
                <h4>{activeAward?.displayName ?? copy.results}</h4>
                <p>{activeResults.length} {copy.applicantsCount(activeResults.length)}</p>
              </div>
              {activeResults.length ? (
                <div className={styles.ranking}>
                  <div className={styles.rankingHeader} aria-hidden="true"><span>{copy.place}</span><span>{copy.applicant}</span><span>{copy.score}</span></div>
                  <ol aria-label={`${activeAward?.displayName} — ${copy.results}`}>
                    {activeResults.map((result) => (
                      <li key={result.id} className={styles.resultRow} data-result-entry>
                        <span className={`${styles.place} ${result.place === 1 ? styles.first : ""}`}>{result.place ?? "—"}</span>
                        <span className={styles.applicantName}>{result.name}</span>
                        <span className={styles.score}><Star size={15} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />{result.averageScore.toFixed(1)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className={styles.empty} data-result-entry>
                  <Trophy size={30} strokeWidth={1.35} aria-hidden="true" />
                  <strong>{copy.empty}</strong><p>{copy.emptyHint}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <a className={styles.backLink} href="#categories">{t.common.browseCategories}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
