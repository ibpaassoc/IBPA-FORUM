"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: PUBLIC_MOTION_EASE },
  },
};

function CategorySelectionCard({
  category,
  index,
  availableCount,
  selectedCount,
  onSelect,
}: {
  category: CategoryOption;
  index: number;
  availableCount: number;
  selectedCount: number;
  onSelect: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const flow = t.account.addFlow;
  const allOwned = availableCount === 0;

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -3, scale: 1.004, transition: { duration: 0.18, ease: PUBLIC_MOTION_EASE } }
      }
      onClick={onSelect}
      className={`group relative flex min-h-[172px] flex-col overflow-hidden rounded-[26px] border p-5 text-left backdrop-blur-2xl transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] ${
        selectedCount > 0
          ? "border-[var(--color-blue)]/55 bg-[linear-gradient(150deg,rgba(255,255,255,0.9),rgba(185,217,235,0.32))] shadow-[0_22px_62px_rgba(114,160,193,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]"
          : "border-[rgba(114,160,193,0.2)] bg-white/74 shadow-[0_18px_54px_rgba(37,42,45,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] hover:border-[var(--color-blue)]/45 hover:shadow-[0_22px_62px_rgba(114,160,193,0.14)]"
      }`}
    >
      <div className="pointer-events-none absolute -right-14 -top-16 size-40 rounded-full bg-[rgba(185,217,235,0.3)] blur-2xl transition duration-300 group-hover:bg-[rgba(185,217,235,0.45)]" />

      <div className="relative flex items-start justify-between gap-3">
        <span className="rounded-full border border-[var(--color-blue)]/20 bg-white/65 px-3 py-1 text-[0.66rem] font-semibold tracking-[0.2em] text-[var(--color-blue)] shadow-sm backdrop-blur-xl">
          {String(index + 1).padStart(2, "0")}
        </span>
        {selectedCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-blue)]/30 bg-[var(--color-blue)] px-2.5 py-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.1em] text-white shadow-[0_10px_24px_rgba(114,160,193,0.3)]">
            <CheckCircle2 aria-hidden size={12} /> {selectedCount} {flow.selectedBadge}
          </span>
        ) : (
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-[var(--color-blue)]/35 shadow-[0_0_16px_rgba(114,160,193,0.4)] transition duration-200 group-hover:bg-[var(--color-blue)]"
          />
        )}
      </div>

      <div className="relative mt-auto pt-8">
        <h3 className="font-[var(--font-title-family)] text-[1.3rem] font-light leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
          {category.name}
        </h3>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--color-ink-soft)]">
          {allOwned
            ? flow.allOwned
            : `${availableCount} ${availableCount === 1 ? flow.nominationLabel : flow.nominationsLabel} ${flow.available}`}
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] opacity-70 transition duration-200 group-hover:opacity-100">
          {allOwned ? flow.viewNominations : flow.chooseNominations}
          <ArrowRight
            aria-hidden
            size={13}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </motion.button>
  );
}

/**
 * Step 1 of the Add Nomination flow: responsive glass category cards,
 * echoing the public Categories page grid.
 */
export default function CategorySelectionGrid({
  categories,
  ownedAwardIds,
  selectedAwardIds,
  onSelectCategory,
}: {
  categories: CategoryOption[];
  ownedAwardIds: Set<string>;
  selectedAwardIds: string[];
  onSelectCategory: (categoryId: string) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const selected = new Set(selectedAwardIds);

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? undefined : "visible"}
      className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3"
    >
      {categories.map((category, index) => (
        <CategorySelectionCard
          key={category.id}
          category={category}
          index={index}
          availableCount={category.awards.filter((award) => !ownedAwardIds.has(award.id)).length}
          selectedCount={category.awards.filter((award) => selected.has(award.id)).length}
          onSelect={() => onSelectCategory(category.id)}
        />
      ))}
    </motion.div>
  );
}
