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
};

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

  return (
    <DashboardCard className="flex flex-col gap-3">
      {/* One responsive filter row: search + dropdowns wrap cleanly, no duplicated DOM. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={adminT.filters.search}
          className="w-full sm:min-w-[60px] sm:flex-1"
        />

        {selects.map((select) => (
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

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(114,160,193,0.14)] pt-3">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] px-3 text-xs font-medium text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue)] hover:bg-[rgba(225,240,248,0.92)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
            >
              <span className="max-w-48 truncate">{chip.label}</span>
              <X aria-hidden size={13} />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-8 rounded-full px-3 text-xs font-semibold text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
          >
            {adminT.filters.clearAll}
          </button>
        </div>
      ) : null}
    </DashboardCard>
  );
}
