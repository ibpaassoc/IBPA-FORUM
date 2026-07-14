export type NominationCardData = {
  id: string;
  status: string;
  locked: boolean;
  awardName: string;
  categoryName: string;
  updatedAtLabel: string;
  completionPercentage: number;
  missingRequiredCount: number;
};

export type NominationTone = "blue" | "orange" | "green" | "gray";

export function nominationTone(nomination: Pick<NominationCardData, "status" | "locked">): NominationTone {
  if (nomination.locked) return "gray";
  switch (nomination.status) {
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "SCORED":
      return "green";
    case "DRAFT":
    case "RETURNED_FOR_CHANGES":
      return "orange";
    case "WITHDRAWN":
    case "REJECTED":
      return "gray";
    default:
      return "blue";
  }
}

export function nominationStatusLabel(nomination: Pick<NominationCardData, "status" | "locked">) {
  if (nomination.locked) return "Locked";
  return nomination.status.toLowerCase().replaceAll("_", " ");
}

export function nominationActionLabel(nomination: Pick<NominationCardData, "status" | "locked" | "completionPercentage">) {
  if (nomination.locked) return "View";
  if (nomination.status === "SUBMITTED" || nomination.status === "UNDER_REVIEW") return "View";
  if (nomination.completionPercentage === 0) return "Start";
  return "Continue";
}

export function missingFieldsLabel(count: number) {
  if (count === 0) return "All required fields complete";
  return `${count} required field${count === 1 ? "" : "s"} missing`;
}

export function formatDateLabel(value: Date | null | undefined, locale = "en") {
  return value
    ? new Intl.DateTimeFormat(locale === "ua" ? "uk" : locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(value)
    : "—";
}

export function daysUntil(value: Date) {
  return Math.max(0, Math.ceil((value.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

type NominationSource = {
  id: string;
  status: string;
  lockedAt: Date | null;
  updatedAt: Date;
  award: { name: string };
  category: { name: string };
  completionPercentage: number;
  missingRequiredCount: number;
};

export function toNominationCardData(
  nomination: NominationSource,
  locale = "en",
): NominationCardData {
  return {
    id: nomination.id,
    status: nomination.status,
    locked: nomination.lockedAt !== null || nomination.status === "LOCKED",
    awardName: nomination.award.name,
    categoryName: nomination.category.name,
    updatedAtLabel: formatDateLabel(nomination.updatedAt, locale),
    completionPercentage: nomination.completionPercentage,
    missingRequiredCount: nomination.missingRequiredCount,
  };
}

const SUBMITTED_STATUSES = new Set(["SUBMITTED", "UNDER_REVIEW", "SCORED", "LOCKED"]);
const DRAFT_STATUSES = new Set(["DRAFT", "RETURNED_FOR_CHANGES"]);

export function applicantNominationStats(
  nominations: Array<Pick<NominationSource, "status" | "lockedAt" | "completionPercentage">>,
) {
  const total = nominations.length;
  const submitted = nominations.filter(
    (nomination) => nomination.lockedAt !== null || SUBMITTED_STATUSES.has(nomination.status),
  ).length;
  const drafts = nominations.filter(
    (nomination) => nomination.lockedAt === null && DRAFT_STATUSES.has(nomination.status),
  ).length;
  const overallCompletion =
    total === 0
      ? 0
      : Math.round(
          nominations.reduce((sum, nomination) => sum + nomination.completionPercentage, 0) / total,
        );

  return {
    total,
    submitted,
    drafts,
    remaining: total - submitted,
    overallCompletion,
  };
}
