import type { JuryNominationListItem } from "@/features/jury/server/reviews";

export type JuryReviewStatus = JuryNominationListItem["reviewStatus"];
export type JuryTone = "blue" | "amber" | "green" | "gray";

/** Completed and locked reviews are both final from the judge's point of view. */
export function isFinalReviewStatus(status: JuryReviewStatus) {
  return status === "COMPLETED" || status === "LOCKED";
}

export function juryStatusTone(status: JuryReviewStatus): JuryTone {
  if (isFinalReviewStatus(status)) return "green";
  if (status === "IN_PROGRESS") return "amber";
  return "gray";
}

export const juryBadgeToneClasses: Record<JuryTone, string> = {
  blue: "border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] text-[#356f98]",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  gray: "border-[rgba(37,42,45,0.12)] bg-white/78 text-[var(--color-ink-soft)]",
};

export const juryBarToneClasses: Record<JuryTone, string> = {
  blue: "bg-[var(--color-blue)]",
  amber: "bg-amber-400",
  green: "bg-emerald-500",
  gray: "bg-[rgba(37,42,45,0.28)]",
};

/**
 * Reviewed percentage for a queue card. Only a finished review has a
 * meaningful percentage from the list query; in-progress drafts report their
 * live criterion count from the review workspace instead.
 */
export function listProgress(status: JuryReviewStatus) {
  return isFinalReviewStatus(status) ? 100 : null;
}

export function formatDateLabel(value: Date | null, locale = "en") {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "ua" ? "uk" : locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}
