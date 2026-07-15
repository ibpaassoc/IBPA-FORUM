"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Check, Lock } from "lucide-react";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.035, delayChildren: 0.03 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: PUBLIC_MOTION_EASE },
  },
};

function NominationSelectionItem({
  name,
  owned,
  selected,
  onToggle,
}: {
  name: string;
  owned: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  return (
    <motion.li variants={itemVariants}>
      <button
        type="button"
        disabled={owned}
        aria-pressed={selected}
        onClick={onToggle}
        className={`flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-[20px] border px-4 py-3 text-left text-sm backdrop-blur-xl transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed ${
          owned
            ? "border-[rgba(37,42,45,0.08)] bg-white/45 text-[var(--color-ink-muted)]"
            : selected
              ? "border-[var(--color-blue)]/60 bg-[linear-gradient(150deg,rgba(255,255,255,0.92),rgba(185,217,235,0.4))] text-[var(--color-ink)] shadow-[0_16px_40px_rgba(114,160,193,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]"
              : "border-[rgba(114,160,193,0.2)] bg-white/72 text-[var(--color-ink-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:-translate-y-px hover:border-[var(--color-blue)]/45 hover:bg-[var(--color-blue-wash)]/70 hover:text-[var(--color-ink)]"
        }`}
      >
        <span className="min-w-0">
          <span className="block break-words leading-snug">{name}</span>
          {owned ? (
            <span className="mt-1 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#356f98]">
              <Lock aria-hidden size={11} /> {t.account.addFlow.alreadyPurchased}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition duration-200 ${
            selected
              ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white shadow-[0_8px_18px_rgba(114,160,193,0.35)]"
              : owned
                ? "border-[rgba(37,42,45,0.12)] bg-white/60 text-transparent"
                : "border-[rgba(114,160,193,0.35)] bg-white/80 text-transparent"
          }`}
        >
          <Check size={13} strokeWidth={3} />
        </span>
      </button>
    </motion.li>
  );
}

/**
 * Step 2 of the Add Nomination flow: the active category's nominations as one
 * coherent list of selectable glass rows, with owned items shown unavailable.
 */
export default function NominationSelectionList({
  category,
  ownedAwardIds,
  selectedAwardIds,
  onToggleAward,
}: {
  category: CategoryOption;
  ownedAwardIds: Set<string>;
  selectedAwardIds: string[];
  onToggleAward: (awardId: string) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const selected = new Set(selectedAwardIds);
  const allOwned = category.awards.every((award) => ownedAwardIds.has(award.id));

  return (
    <div>
      {allOwned ? (
        <p className="mb-3 rounded-[20px] border border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)]/80 px-4 py-3 text-sm leading-relaxed text-[#356f98]">
          {t.account.addFlow.allOwnedCategory}
        </p>
      ) : null}
      <motion.ul
        key={category.id}
        variants={shouldReduceMotion ? undefined : listVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
        className="grid gap-2 sm:grid-cols-2"
      >
        {category.awards.map((award) => (
          <NominationSelectionItem
            key={award.id}
            name={award.name}
            owned={ownedAwardIds.has(award.id)}
            selected={selected.has(award.id)}
            onToggle={() => onToggleAward(award.id)}
          />
        ))}
      </motion.ul>
    </div>
  );
}
