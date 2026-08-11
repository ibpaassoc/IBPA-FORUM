"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import type { NominationScoringDefinition } from "@/features/jury/scoring/category-scoring";
import JudgeReviewCard, {
  type JudgeReviewRow,
} from "@/features/admin/components/scoring/JudgeReviewCard";
import { DashboardEmptyState, GlassCard } from "@/shared/components/admin/DashboardUI";
import IbpaDropdown from "@/shared/components/admin/IbpaDropdown";

const INITIAL_VISIBLE = 5;

const statusOrder: Record<JudgeReviewRow["scoreStatus"], number> = {
  SUBMITTED: 0,
  REOPENED: 1,
  DRAFT: 2,
  NOT_STARTED: 3,
};

/**
 * Список отзывов судей по номинации с фильтром по статусу и сортировкой.
 * Данных немного (судьи одной категории), поэтому фильтрация клиентская —
 * без перезагрузки страницы и без потери раскрытых отзывов.
 */
export default function JudgeReviewList({
  rows,
  scoringDefinition,
}: {
  rows: JudgeReviewRow[];
  scoringDefinition: NominationScoringDefinition;
}) {
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("recent");
  const [expanded, setExpanded] = useState(false);

  const visibleRows = useMemo(() => {
    const filtered = status ? rows.filter((row) => row.scoreStatus === status) : [...rows];

    filtered.sort((left, right) => {
      if (sort === "score") {
        const comparison = (right.totalScore ?? -1) - (left.totalScore ?? -1);
        if (comparison !== 0) return comparison;
      }

      if (sort === "name") {
        const comparison = left.judgeName.localeCompare(right.judgeName, "ru");
        if (comparison !== 0) return comparison;
      }

      if (sort === "recent") {
        const comparison = right.lastActivityTime - left.lastActivityTime;
        if (comparison !== 0) return comparison;
      }

      const statusComparison = statusOrder[left.scoreStatus] - statusOrder[right.scoreStatus];
      if (statusComparison !== 0) return statusComparison;

      return left.judgeName.localeCompare(right.judgeName, "ru");
    });

    return filtered;
  }, [rows, status, sort]);

  const hiddenCount = Math.max(visibleRows.length - INITIAL_VISIBLE, 0);
  const shownRows = expanded ? visibleRows : visibleRows.slice(0, INITIAL_VISIBLE);

  return (
    <GlassCard className="rounded-[28px] p-0">
      <div className="flex flex-col gap-3 border-b border-[rgba(37,42,45,0.08)] p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <h2 className="flex items-center gap-2.5 font-[var(--font-title-family)] text-[1.6rem] font-light tracking-[-0.025em] text-[var(--color-ink)]">
          {adminT.scoring.judgeScores}
          <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[var(--color-blue-wash)] px-2 py-0.5 font-[var(--font-ui-family)] text-[0.72rem] font-semibold text-[#356f98]">
            {rows.length}
          </span>
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <IbpaDropdown
            value={status}
            onChange={setStatus}
            ariaLabel={adminT.scoring.reviewsFilterAll}
            className="w-full sm:w-44"
            options={[
              { value: "", label: adminT.scoring.reviewsFilterAll },
              { value: "SUBMITTED", label: adminT.statuses.SUBMITTED },
              { value: "DRAFT", label: adminT.statuses.DRAFT },
              { value: "NOT_STARTED", label: adminT.statuses.NOT_STARTED },
            ]}
          />
          <IbpaDropdown
            value={sort}
            onChange={setSort}
            ariaLabel={adminT.scoring.reviewsSortLabel}
            className="w-full sm:w-56"
            options={[
              { value: "recent", label: adminT.scoring.reviewsSortRecent },
              { value: "score", label: adminT.scoring.reviewsSortScore },
              { value: "name", label: adminT.scoring.reviewsSortName },
            ]}
          />
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="p-4 md:p-5">
          <DashboardEmptyState
            icon={<Users size={22} />}
            title={adminT.scoring.noJudgesAssigned}
            description={adminT.scoring.noJudges}
          />
        </div>
      ) : (
        <>
          <div className="divide-y divide-[rgba(37,42,45,0.08)]">
            {shownRows.map((row) => (
              <JudgeReviewCard
                key={row.judgeId}
                row={row}
                scoringDefinition={scoringDefinition}
              />
            ))}
          </div>

          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((previous) => !previous)}
              className="flex w-full items-center justify-center gap-2 border-t border-[rgba(37,42,45,0.08)] px-4 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:bg-[var(--color-blue-wash)]/60 hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
            >
              {expanded
                ? adminT.scoring.showLessJudges
                : adminT.scoring.showMoreJudges(hiddenCount)}
              {expanded ? (
                <ChevronUp aria-hidden size={15} />
              ) : (
                <ChevronDown aria-hidden size={15} />
              )}
            </button>
          ) : null}
        </>
      )}
    </GlassCard>
  );
}
