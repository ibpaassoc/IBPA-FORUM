"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import { DashboardCard, SearchBar } from "@/shared/components/admin/DashboardUI";

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

const glassSelectClass =
  "h-11 w-full cursor-pointer appearance-none rounded-full border border-[rgba(114,160,193,0.22)] bg-white/74 pl-4 pr-10 text-[0.86rem] leading-none text-[var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_26px_rgba(37,42,45,0.045)] outline-none backdrop-blur-xl transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]/60 focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)]";

function GlassSelect({
  select,
  onSelectChange,
  className,
}: {
  select: FilterSelect;
  onSelectChange: (key: string, value: string) => void;
  className?: string;
}) {
  return (
    <label className={`relative block ${className ?? ""}`}>
      <span className="sr-only">{select.label}</span>
      <select
        value={select.value}
        onChange={(event) => onSelectChange(select.key, event.target.value)}
        className={glassSelectClass}
      >
        {select.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
      />
    </label>
  );
}

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
 * Search + segmented status chips + styled dropdowns; on mobile the dropdowns
 * collapse into a "Filters" panel. Renders active-filter chips with individual
 * remove + a "clear all" action. Fully controlled — the parent owns state and
 * does the actual filtering.
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
  const activeDropdownCount = dropdowns.filter((select) => select.value).length;

  return (
    <DashboardCard className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={adminT.filters.search}
          className="flex-1"
        />

        {/* Desktop dropdowns */}
        <div className="hidden flex-wrap gap-2 lg:flex">
          {dropdowns.map((select) => (
            <GlassSelect
              key={select.key}
              select={select}
              onSelectChange={onSelectChange}
              className="w-auto min-w-44"
            />
          ))}
        </div>

        {/* Mobile collapsible filter panel */}
        <details className="group lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/74 px-4 text-sm font-medium text-[var(--color-ink)] shadow-[0_10px_26px_rgba(37,42,45,0.045)] backdrop-blur-xl transition hover:border-[var(--color-blue)]">
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal aria-hidden size={15} className="text-[var(--color-blue)]" />
              {adminT.filters.toggle}
              {activeDropdownCount > 0 ? (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-blue)] text-[0.62rem] font-semibold text-white">
                  {activeDropdownCount}
                </span>
              ) : null}
            </span>
            <ChevronDown
              aria-hidden
              size={15}
              className="text-[var(--color-ink-muted)] transition group-open:rotate-180"
            />
          </summary>
          <div className="mt-2 grid gap-2">
            {dropdowns.map((select) => (
              <GlassSelect key={select.key} select={select} onSelectChange={onSelectChange} />
            ))}
          </div>
        </details>
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
