export const SCORING_STATE_KEY = "scoring_state";
export const SCORING_WRITE_LOCK_KEY = "forum:site-setting:scoring-state";

export type ScoringState = {
  status: "OPEN" | "CLOSED";
  closedAt: Date | null;
};

export function parseScoringState(value: unknown): ScoringState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { status: "OPEN", closedAt: null };
  }

  const record = value as Record<string, unknown>;
  if (record.status !== "CLOSED") {
    return { status: "OPEN", closedAt: null };
  }

  const parsed = typeof record.closedAt === "string" ? new Date(record.closedAt) : null;
  return {
    status: "CLOSED",
    closedAt: parsed && !Number.isNaN(parsed.getTime()) ? parsed : null,
  };
}
