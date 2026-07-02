"use client";

import { X } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import { DashboardCard, SearchBar } from "@/shared/components/admin/DashboardUI";
import IbpaDropdown from "@/shared/components/admin/IbpaDropdown";

export type FilterSelect = {
  key: string;
  /** Visually-hidden accessible label. */
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  /**
   * "segmented" renders the options as a glassmorphic chip row (great for
   * short status lists); "select" (default) renders a styled dropdown.
   */
  variant?: "segmented" | "select";
};

function SegmentedControl({
  select,
  onSelectChange,
}: {
  select: FilterSelect;
  onSelectChange: (key: string, value: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label={select.label}
      className="flex gap-1 overflow-x-auto rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-white/62 p-1 shadow-[0_10px_28px_rgba(37,42,45,0.04)] backdrop-blur-xl no-scrollbar"
    >
      {select.options.map((option) => {
        const active = select.value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelectChange(select.key, option.value)}
            className={`inline-flex min-h-9 shrink-0 items-center justify-center rounded-[16px] px-3.5 text-[0.68rem] font-semibold uppercase leading-none tracking-[0.09em] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] ${
              active
                ? "bg-[var(--color-blue)] text-white shadow-[0_10px_22px_rgba(114,160,193,0.28)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Glassmorphic filter bar for application lists.
 * One filter block: search + reusable IBPA dropdowns wrap into a single
 * responsive row, followed by segmented status chips and active-filter chips
 * with individual remove + a "clear all" action. Fully controlled — the parent
 * owns state and does the actual filtering.
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
  const segmented = selects.filter((select) => select.variant === "segmented");
  const dropdowns = selects.filter((select) => select.variant !== "segmented");

  const chips = [
    ...(search.trim()
      ? [{ key: "__search", label: `“${search.trim()}”`, clear: () => onSearchChange("") }]
      : []),
    ...dropdowns
      .filter((select) => select.value)
      .map((select) => ({
        key: select.key,
        label: select.options.find((option) => option.value === select.value)?.label ?? select.value,
        clear: () => onSelectChange(select.key, ""),
      })),
  ];

  const hasActiveFilters =
    chips.length > 0 || segmented.some((select) => select.value);

  return (
    <DashboardCard className="flex flex-col gap-3">
      {/* One responsive filter row: search + dropdowns wrap cleanly, no duplicated DOM. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={adminT.filters.search}
          className="w-full sm:min-w-[220px] sm:flex-1"
        />

        {dropdowns.map((select) => (
          <IbpaDropdown
            key={select.key}
            ariaLabel={select.label}
            options={select.options}
            value={select.value}
            onChange={(value) => onSelectChange(select.key, value)}
            className="w-full sm:w-auto sm:min-w-[11rem]"
          />
        ))}
      </div>

      {segmented.map((select) => (
        <SegmentedControl key={select.key} select={select} onSelectChange={onSelectChange} />
      ))}

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(37,42,45,0.07)] pt-3">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)] px-3 py-1 text-xs font-medium text-[var(--color-ink)] backdrop-blur-xl transition hover:border-[var(--color-blue)] hover:bg-white"
            >
              <span className="max-w-[14rem] truncate">{chip.label}</span>
              <X aria-hidden size={12} className="shrink-0 text-[var(--color-ink-soft)]" />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-blue)] transition hover:text-[var(--color-ink)]"
          >
            {adminT.filters.clearAll}
          </button>
        </div>
      ) : null}
    </DashboardCard>
  );
}
