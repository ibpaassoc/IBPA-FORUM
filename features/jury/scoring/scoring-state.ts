export const SCORING_STATE_KEY = "scoring_state";
export const SCORING_WRITE_LOCK_KEY = "forum:site-setting:scoring-state";

export type ScoringState = {
  status: "OPEN" | "CLOSED";
  closedAt: Date | null;
  /**
   * Профили жюри, которым администратор вручную открыл оценивание после
   * глобального закрытия. Пусто, пока оценивание открыто для всех.
   */
  openJuryIds: string[];
};

export type JuryScoringState = ScoringState & {
  /** Оценивание доступно этому члену жюри только из-за ручного исключения. */
  manuallyOpened: boolean;
};

function parseOpenJuryIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return [...new Set(ids)].sort();
}

export function parseScoringState(value: unknown): ScoringState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { status: "OPEN", closedAt: null, openJuryIds: [] };
  }

  const record = value as Record<string, unknown>;
  if (record.status !== "CLOSED") {
    return { status: "OPEN", closedAt: null, openJuryIds: [] };
  }

  const parsed = typeof record.closedAt === "string" ? new Date(record.closedAt) : null;
  return {
    status: "CLOSED",
    closedAt: parsed && !Number.isNaN(parsed.getTime()) ? parsed : null,
    openJuryIds: parseOpenJuryIds(record.openJuryIds),
  };
}

/** Открыто ли оценивание конкретному члену жюри — глобально или вручную. */
export function isScoringOpenForJury(state: ScoringState, juryProfileId: string) {
  return state.status === "OPEN" || state.openJuryIds.includes(juryProfileId);
}

/** Состояние оценивания глазами конкретного члена жюри. */
export function resolveJuryScoringState(
  state: ScoringState,
  juryProfileId: string
): JuryScoringState {
  const manuallyOpened = state.status === "CLOSED" && state.openJuryIds.includes(juryProfileId);
  return {
    ...state,
    status: manuallyOpened ? "OPEN" : state.status,
    manuallyOpened,
  };
}
