"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { Check, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { NominationScoringDefinition } from "@/features/jury/scoring/category-scoring";
import JuryReviewScorecard, {
  JurySubmitConfirm,
  useJuryScoring,
  type JuryReviewValue,
  type JuryScoring,
} from "@/features/account/components/jury/JuryReviewScorecard";
import JuryScoreDock from "@/features/account/components/jury/JuryScoreDock";

type ReviewTab = "submission" | "files" | "scorecard";

const TABS: ReviewTab[] = ["submission", "files", "scorecard"];

function tabStorageKey(nominationId: string) {
  return `ibpa:jury-review-tab:${nominationId}`;
}

function isReviewTab(value: string | null): value is ReviewTab {
  return value === "submission" || value === "files" || value === "scorecard";
}

/** The remembered tab never changes after hydration, so nothing to subscribe to. */
function subscribeToNothing() {
  return () => {};
}

/**
 * Compact criteria overview for the mobile Scorecard tab. Each row opens the
 * scoring sheet on that criterion, so the tab doubles as a jump list.
 */
function MobileCriteriaList({
  scoring,
  onSelect,
}: {
  scoring: JuryScoring;
  onSelect: (index: number) => void;
}) {
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;

  return (
    <ul className="grid gap-2">
      {scoring.criteria.map((criterion, index) => {
        const value = scoring.scoreOf(criterion.key);
        const scored = value !== null;
        return (
          <li key={criterion.key}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              className="flex w-full min-w-0 items-center gap-3 rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/72 p-3.5 text-left transition hover:border-[rgba(114,160,193,0.32)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]"
            >
              <span
                className={clsx(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border",
                  scored
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[rgba(114,160,193,0.22)] bg-white text-transparent",
                )}
              >
                <Check aria-hidden size={14} strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.92rem] font-medium leading-snug text-[var(--color-ink)]">
                  {criterion.label}
                </span>
                <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-blue)]">
                  0–{criterion.maxScore} {copy.pointsRange}
                </span>
              </span>
              <span className="shrink-0 font-[var(--font-title-family)] text-[1.5rem] font-light leading-none text-[var(--color-ink)]">
                {scored ? value : "—"}
              </span>
              <ChevronRight aria-hidden size={16} className="shrink-0 text-[var(--color-blue)]" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Responsive review workspace. On desktop the submitted material and the
 * scorecard sit side by side with the scorecard sticky, so a judge never
 * leaves the page to score. On phones the same content is split into
 * Submission / Files / Scorecard tabs above a persistent score dock.
 *
 * Draft scores live in `useJuryScoring` at this level, so switching tabs (or a
 * `router.refresh()` after saving) never discards unsaved work. The active tab
 * and each tab's scroll offset are restored on return.
 */
export default function JuryReviewWorkspace({
  nominationId,
  scoringDefinition,
  review,
  header,
  submission,
  files,
  peers,
}: {
  nominationId: string;
  scoringDefinition: NominationScoringDefinition;
  review: JuryReviewValue | null;
  header: ReactNode;
  submission: ReactNode;
  files: ReactNode;
  peers?: ReactNode;
}) {
  const { t } = useLanguage();
  const labels = t.account.jury.review;
  const scoring = useJuryScoring({ nominationId, scoringDefinition, initialReview: review });
  // The tab this judge last had open, read after hydration so the server and
  // the first client render still agree.
  const rememberedTab = useSyncExternalStore(
    subscribeToNothing,
    () => window.sessionStorage.getItem(tabStorageKey(nominationId)),
    () => null,
  );
  const [selectedTab, setSelectedTab] = useState<ReviewTab | null>(null);
  const activeTab: ReviewTab =
    selectedTab ?? (isReviewTab(rememberedTab) ? rememberedTab : "submission");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIndex, setSheetIndex] = useState(0);
  const scrollOffsets = useRef<Partial<Record<ReviewTab, number>>>({});
  const restoreTo = useRef<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Restore the remembered offset after the newly selected panel has painted.
  useEffect(() => {
    if (restoreTo.current === null) return;
    const target = restoreTo.current;
    restoreTo.current = null;
    window.scrollTo({ top: target, behavior: "auto" });
  }, [activeTab]);

  const selectTab = useCallback(
    (next: ReviewTab) => {
      if (next === activeTab) return;
      scrollOffsets.current[activeTab] = window.scrollY;
      restoreTo.current = scrollOffsets.current[next] ?? 0;
      window.sessionStorage.setItem(tabStorageKey(nominationId), next);
      setSelectedTab(next);
    },
    [activeTab, nominationId],
  );

  function handleTabKeys(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(index + delta + TABS.length) % TABS.length];
    tabsRef.current?.querySelector<HTMLButtonElement>(`#jury-tab-${next}`)?.focus();
    selectTab(next);
  }

  const openSheetAt = useCallback(
    (index: number) => {
      setSheetIndex(index);
      setSheetOpen(true);
    },
    [],
  );

  const openSheet = useCallback(() => {
    // Resume on the first unscored criterion so a returning draft picks up
    // where it stopped.
    const firstUnscored = scoring.criteria.findIndex((item) => scoring.values[item.key] === "");
    openSheetAt(firstUnscored === -1 ? 0 : firstUnscored);
  }, [openSheetAt, scoring.criteria, scoring.values]);

  const tabLabels: Record<ReviewTab, string> = {
    submission: labels.submission,
    files: labels.files,
    scorecard: labels.scorecard,
  };

  return (
    <div className="flex flex-col gap-5">
      {header}

      <div
        ref={tabsRef}
        role="tablist"
        aria-label={labels.tabsAria}
        className="flex gap-1.5 rounded-[22px] border border-[rgba(114,160,193,0.18)] bg-white/66 p-1.5 shadow-[0_12px_34px_rgba(37,42,45,0.05)] backdrop-blur-xl lg:hidden"
      >
        {TABS.map((tab, index) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              id={`jury-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`jury-panel-${tab}`}
              tabIndex={active ? 0 : -1}
              onClick={() => selectTab(tab)}
              onKeyDown={(event) => handleTabKeys(event, index)}
              className={clsx(
                "flex min-h-11 flex-1 items-center justify-center rounded-[16px] px-2 text-[0.66rem] font-semibold uppercase tracking-[0.09em] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]",
                active
                  ? "bg-[var(--color-blue)] text-white shadow-[0_10px_24px_rgba(114,160,193,0.26)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
              )}
            >
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div
            id="jury-panel-submission"
            role="tabpanel"
            aria-labelledby="jury-tab-submission"
            className={clsx("min-w-0", activeTab !== "submission" && "hidden", "lg:block")}
          >
            {submission}
          </div>
          <div
            id="jury-panel-files"
            role="tabpanel"
            aria-labelledby="jury-tab-files"
            className={clsx("min-w-0", activeTab !== "files" && "hidden", "lg:block")}
          >
            {files}
          </div>
        </div>

        <aside className="hidden min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:flex">
          <JuryReviewScorecard scoring={scoring} />
          {peers}
        </aside>

        <div
          id="jury-panel-scorecard"
          role="tabpanel"
          aria-labelledby="jury-tab-scorecard"
          className={clsx("min-w-0", activeTab !== "scorecard" && "hidden", "lg:hidden")}
        >
          <MobileCriteriaList scoring={scoring} onSelect={openSheetAt} />
        </div>
      </div>

      <JuryScoreDock
        scoring={scoring}
        open={sheetOpen}
        index={sheetIndex}
        onOpen={openSheet}
        onClose={() => setSheetOpen(false)}
        onIndexChange={setSheetIndex}
      />
      <JurySubmitConfirm scoring={scoring} />
    </div>
  );
}
