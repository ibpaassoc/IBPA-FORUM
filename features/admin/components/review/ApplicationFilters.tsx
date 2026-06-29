"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  DashboardCard,
  SearchBar,
  dashboardSelectClass,
} from "@/shared/components/admin/DashboardUI";

export type FilterSelect = {
  key: string;
  /** Visually-hidden accessible label. */
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
};

/**
 * Compact, reusable filter bar for application lists.
 * Desktop: search + inline dropdowns. Mobile: search + a collapsible filter panel.
 * Renders active-filter chips with individual remove + a "clear all" action.
 * Fully controlled — the parent owns state and does the actual filtering.
 */
export default function ApplicationFilters({
  search,
  onSearchChange,
  selects,
  onSelectChange,
  onClearAll,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  selects: FilterSelect[];
  onSelectChange: (key: string, value: string) => void;
  onClearAll: () => void;
}) {
  const { t } = useLanguage();

  const chips = [
    ...(search.trim()
      ? [{ key: "__search", label: `“${search.trim()}”`, clear: () => onSearchChange("") }]
      : []),
    ...selects
      .filter((select) => select.value)
      .map((select) => ({
        key: select.key,
        label: select.options.find((option) => option.value === select.value)?.label ?? select.value,
        clear: () => onSelectChange(select.key, ""),
      })),
  ];

  const activeFilterCount = selects.filter((select) => select.value).length;

  return (
    <DashboardCard className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={t.filters.search}
          className="flex-1"
        />

        {/* Desktop dropdowns */}
        <div className="hidden flex-wrap gap-2 sm:flex">
          {selects.map((select) => (
            <label key={select.key} className="block">
              <span className="sr-only">{select.label}</span>
              <select
                value={select.value}
                onChange={(event) => onSelectChange(select.key, event.target.value)}
                className={`${dashboardSelectClass} w-auto min-w-40`}
              >
                {select.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {/* Mobile collapsible filter panel */}
        <details className="group sm:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-[18px] border border-[rgba(114,160,193,0.22)] bg-white/74 px-4 text-sm font-medium text-[var(--color-ink)]">
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal aria-hidden size={15} className="text-[var(--color-blue)]" />
              {t.filters.toggle}
              {activeFilterCount > 0 ? (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-blue)] text-[0.62rem] font-semibold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </span>
            <span className="text-[var(--color-ink-muted)] transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-2 grid gap-2">
            {selects.map((select) => (
              <label key={select.key} className="block">
                <span className="sr-only">{select.label}</span>
                <select
                  value={select.value}
                  onChange={(event) => onSelectChange(select.key, event.target.value)}
                  className={dashboardSelectClass}
                >
                  {select.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </details>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(37,42,45,0.07)] pt-3">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)] px-3 py-1 text-xs font-medium text-[var(--color-ink)] transition hover:bg-white"
            >
              <span className="max-w-[14rem] truncate">{chip.label}</span>
              <X aria-hidden size={12} className="shrink-0 text-[var(--color-ink-soft)]" />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-blue)] transition hover:text-[var(--color-ink)]"
          >
            {t.filters.clearAll}
          </button>
        </div>
      ) : null}
    </DashboardCard>
  );
}
