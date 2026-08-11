"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import {
  DashboardCard,
  DashboardPrimaryBtn,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";
import IbpaDropdown from "@/shared/components/admin/IbpaDropdown";

export type ScoringFilterState = {
  q: string;
  category?: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
  progress?: "NO_JUDGES" | "UNDER_50" | "PARTIAL" | "FULL";
  sort: string;
  minScore?: number;
  maxScore?: number;
};

const SCORING_BASE_PATH = "/admin/scoring";

/**
 * Панель фильтров аудита оценок.
 *
 * Фильтрация серверная (нужна для пагинации и диапазонов баллов), поэтому
 * состояние живёт в query-параметрах: выпадающие списки применяются сразу,
 * текстовые поля — по «Применить» или Enter. Активные фильтры показаны
 * чипами, каждый снимается отдельно.
 */
export default function ScoringFilters({
  filters,
  categories,
  perPage,
}: {
  filters: ScoringFilterState;
  categories: string[];
  perPage: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);
  const [minScore, setMinScore] = useState(filters.minScore?.toString() ?? "");
  const [maxScore, setMaxScore] = useState(filters.maxScore?.toString() ?? "");

  function pushFilters(next: Partial<ScoringFilterState> & { resetText?: boolean }) {
    // «in» вместо `??`: снятие фильтра передаётся как undefined и не должно
    // подхватывать прежнее значение из состояния полей.
    const merged = {
      q: next.resetText ? "" : "q" in next ? (next.q ?? "") : search,
      category: "category" in next ? next.category : filters.category,
      status: "status" in next ? next.status : filters.status,
      progress: "progress" in next ? next.progress : filters.progress,
      sort: next.sort ?? filters.sort,
      minScore: next.resetText
        ? ""
        : "minScore" in next
          ? (next.minScore?.toString() ?? "")
          : minScore,
      maxScore: next.resetText
        ? ""
        : "maxScore" in next
          ? (next.maxScore?.toString() ?? "")
          : maxScore,
    };

    const params = new URLSearchParams();
    if (merged.q.trim()) params.set("q", merged.q.trim());
    if (merged.category) params.set("category", merged.category);
    if (merged.status) params.set("status", merged.status);
    if (merged.progress) params.set("progress", merged.progress);
    if (merged.sort && merged.sort !== "averageScore") params.set("sort", merged.sort);
    if (merged.minScore.trim()) params.set("minScore", merged.minScore.trim());
    if (merged.maxScore.trim()) params.set("maxScore", merged.maxScore.trim());
    if (perPage !== 10) params.set("perPage", String(perPage));

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${SCORING_BASE_PATH}?${query}` : SCORING_BASE_PATH);
    });
  }

  const statusOptions = [
    { value: "", label: adminT.filters.allStatuses },
    { value: "NOT_STARTED", label: adminT.statuses.NOT_STARTED },
    { value: "IN_PROGRESS", label: adminT.statuses.IN_PROGRESS },
    { value: "COMPLETE", label: adminT.statuses.COMPLETE },
  ];

  const progressOptions = [
    { value: "", label: adminT.scoring.progressAny },
    { value: "NO_JUDGES", label: adminT.scoring.progressNoJudges },
    { value: "UNDER_50", label: adminT.scoring.progressUnder50 },
    { value: "PARTIAL", label: adminT.scoring.progressPartial },
    { value: "FULL", label: adminT.scoring.progressFull },
  ];

  const scoreChipLabel = [
    filters.minScore !== undefined ? `${adminT.scoring.filtersScoreFrom} ${filters.minScore}` : "",
    filters.maxScore !== undefined ? `${adminT.scoring.filtersScoreTo} ${filters.maxScore}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const chips = [
    filters.q
      ? {
          key: "q",
          label: adminT.scoring.filterChipSearch(filters.q),
          clear: () => pushFilters({ q: "" }),
        }
      : null,
    filters.category
      ? {
          key: "category",
          label: adminT.scoring.filterChipCategory(filters.category),
          clear: () => pushFilters({ category: undefined }),
        }
      : null,
    filters.status
      ? {
          key: "status",
          label: adminT.scoring.filterChipStatus(adminT.statuses[filters.status]),
          clear: () => pushFilters({ status: undefined }),
        }
      : null,
    filters.progress
      ? {
          key: "progress",
          label:
            progressOptions.find((option) => option.value === filters.progress)?.label ??
            filters.progress,
          clear: () => pushFilters({ progress: undefined }),
        }
      : null,
    scoreChipLabel
      ? {
          key: "score",
          label: adminT.scoring.filterChipScore(scoreChipLabel),
          clear: () => pushFilters({ minScore: undefined, maxScore: undefined }),
        }
      : null,
  ].filter((chip): chip is { key: string; label: string; clear: () => void } => chip !== null);

  const hasPendingText =
    search !== filters.q ||
    minScore !== (filters.minScore?.toString() ?? "") ||
    maxScore !== (filters.maxScore?.toString() ?? "");

  return (
    <DashboardCard className="flex flex-col gap-3">
      {/* Сетка на планшете, гибкая строка на широких экранах. */}
      <form
        className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          pushFilters({});
        }}
      >
        <div className="relative w-full sm:col-span-2 xl:min-w-[220px] xl:flex-1">
          <Search
            aria-hidden
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
          />
          <input
            type="search"
            name="q"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={adminT.scoring.searchPlaceholder}
            aria-label={adminT.scoring.searchPlaceholder}
            className={`${dashboardInputClass} pl-9`}
          />
        </div>

        <IbpaDropdown
          value={filters.category ?? ""}
          onChange={(value) => pushFilters({ category: value || undefined })}
          ariaLabel={adminT.filters.allCategories}
          className="w-full xl:w-48"
          options={[
            { value: "", label: adminT.filters.allCategories },
            ...categories.map((category) => ({ value: category, label: category })),
          ]}
        />

        <IbpaDropdown
          value={filters.status ?? ""}
          onChange={(value) =>
            pushFilters({ status: (value || undefined) as ScoringFilterState["status"] })
          }
          ariaLabel={adminT.filters.allStatuses}
          className="w-full xl:w-44"
          options={statusOptions}
        />

        <div className="flex h-11 w-full items-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/74 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_26px_rgba(37,42,45,0.045)] xl:w-56">
          <span className="shrink-0 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            {adminT.scoring.filtersScoreLabel}
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={minScore}
            onChange={(event) => setMinScore(event.target.value)}
            placeholder={adminT.scoring.filtersScoreFrom}
            aria-label={`${adminT.scoring.filtersScoreLabel} ${adminT.scoring.filtersScoreFrom}`}
            className="min-w-0 flex-1 border-0 bg-transparent text-[0.86rem] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-muted)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span aria-hidden className="text-[var(--color-ink-muted)]">
            –
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={maxScore}
            onChange={(event) => setMaxScore(event.target.value)}
            placeholder={adminT.scoring.filtersScoreTo}
            aria-label={`${adminT.scoring.filtersScoreLabel} ${adminT.scoring.filtersScoreTo}`}
            className="min-w-0 flex-1 border-0 bg-transparent text-[0.86rem] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-muted)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        <IbpaDropdown
          value={filters.progress ?? ""}
          onChange={(value) =>
            pushFilters({ progress: (value || undefined) as ScoringFilterState["progress"] })
          }
          ariaLabel={adminT.scoring.filtersProgress}
          className="w-full xl:w-48"
          options={progressOptions}
        />

        <IbpaDropdown
          value={filters.sort}
          onChange={(value) => pushFilters({ sort: value })}
          ariaLabel={adminT.scoring.filtersSortAria}
          className="w-full xl:w-56"
          options={[
            { value: "averageScore", label: adminT.scoring.sortAverage },
            { value: "averageScoreAsc", label: adminT.scoring.sortAverageAsc },
            { value: "progress", label: adminT.scoring.sortProgress },
            { value: "spread", label: adminT.scoring.sortSpread },
            { value: "updated", label: adminT.scoring.sortUpdated },
            { value: "category", label: adminT.scoring.sortCategory },
            { value: "name", label: adminT.scoring.sortName },
          ]}
        />

        {hasPendingText ? (
          <DashboardPrimaryBtn
            type="submit"
            className="w-full sm:col-span-2 xl:w-auto"
            disabled={isPending}
          >
            {adminT.scoring.applyFilters}
          </DashboardPrimaryBtn>
        ) : null}
      </form>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(114,160,193,0.14)] pt-3">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            {adminT.scoring.activeFilters}
          </span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              title={adminT.scoring.removeFilter}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] px-3 text-xs font-medium text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
            >
              <span className="max-w-56 truncate">{chip.label}</span>
              <X aria-hidden size={13} />
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              pushFilters({
                category: undefined,
                status: undefined,
                progress: undefined,
                resetText: true,
              })
            }
            className="min-h-8 rounded-full px-3 text-xs font-semibold text-[var(--color-blue)] underline-offset-4 transition hover:bg-white/70 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
          >
            {adminT.scoring.resetFilters}
          </button>
        </div>
      ) : null}
    </DashboardCard>
  );
}
