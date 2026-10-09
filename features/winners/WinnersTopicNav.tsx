import { winnerCategories2026 } from "./data2026";
import type { WinnersCopy } from "./copy";
import styles from "./WinnersTopicNav.module.css";

const compactCategoryLabels: Record<string, string> = {
  "Makeup Artistry": "Makeup",
  "Skin Care, Cosmetology & Facial": "Skin care",
  "Body, Wellness & Nutrition": "Wellness",
  "Permanent Makeup": "Permanent",
};

export default function WinnersTopicNav({ c }: { c: WinnersCopy }) {
  return (
    <nav className={styles.nav} aria-label={c.pageTopics} data-winners-topic-nav>
      <ol className={styles.list}>
        <li className={styles.yearItem}>
          <a href="#winners-2026" data-topic-link>{c.year2026}</a>
        </li>
        {winnerCategories2026.map((category, index) => (
          <li key={category.title} className={styles.topicItem}>
            <a
              href={`#winner-category-${index}`}
              aria-label={`${c.jumpToCategory}: ${category.title}`}
              data-topic-link
            >
              <span aria-hidden="true" />
              {compactCategoryLabels[category.title] ?? category.title}
            </a>
          </li>
        ))}
        <li className={styles.yearItem}>
          <a href="#winners-2025" data-topic-link>{c.year2025}</a>
        </li>
      </ol>
    </nav>
  );
}
