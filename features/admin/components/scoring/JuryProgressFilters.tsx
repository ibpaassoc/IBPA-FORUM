"use client";

import { FormEvent, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminT } from "@/lib/i18n/admin";
import IbpaDropdown from "@/shared/components/admin/IbpaDropdown";
import {
  DashboardCard,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";

type Filters = {
  q: string;
  status?: string;
  award?: string;
  category?: string;
  nomination?: string;
  min: number;
  max: number;
  unfinished: boolean;
  drafts: boolean;
  quick?: string;
  sort: string;
};

export default function JuryProgressFilters({
  filters,
  options,
  searchParams,
}: {
  filters: Filters;
  options: {
    awards: Array<{ id: string; name: string }>;
    categories: Array<{ id: string; name: string }>;
    nominations: Array<{ id: string; label: string }>;
  };
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);
  const [min, setMin] = useState(String(filters.min));
  const [max, setMax] = useState(String(filters.max));

  function navigate(next: Partial<Filters>, reset = false) {
    const merged: Filters = reset
      ? { q: "", min: 0, max: 100, unfinished: false, drafts: false, sort: "completion" }
      : { ...filters, q, min: Number(min), max: Number(max), ...next };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && !key.startsWith("jury")) params.set(key, value);
    }
    params.set("tab", "jury-progress");
    if (merged.q.trim()) params.set("juryQ", merged.q.trim());
    if (merged.status) params.set("juryStatus", merged.status);
    if (merged.award) params.set("juryAward", merged.award);
    if (merged.category) params.set("juryCategory", merged.category);
    if (merged.nomination) params.set("juryNomination", merged.nomination);
    if (Number.isFinite(merged.min) && merged.min > 0) params.set("juryMin", String(merged.min));
    if (Number.isFinite(merged.max) && merged.max < 100) params.set("juryMax", String(merged.max));
    if (merged.unfinished) params.set("juryUnfinished", "1");
    if (merged.drafts) params.set("juryDrafts", "1");
    if (merged.quick) params.set("juryQuick", merged.quick);
    if (merged.sort !== "completion") params.set("jurySort", merged.sort);
    if (searchParams.juryPerPage && searchParams.juryPerPage !== "25") params.set("juryPerPage", searchParams.juryPerPage);
    startTransition(() => router.push(`/admin/scoring?${params.toString()}`));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ q, min: Number(min), max: Number(max) });
  }

  const quickFilters = [
    { value: "", label: adminT.scoring.quickAll },
    { value: "COMPLETED", label: adminT.scoring.quickCompleted },
    { value: "IN_PROGRESS", label: adminT.scoring.quickInProgress },
    { value: "NOT_STARTED", label: adminT.scoring.quickNotStarted },
    { value: "HAS_DRAFTS", label: adminT.scoring.quickHasDrafts },
  ];

  return (
    <DashboardCard className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" aria-label={adminT.scoring.juryProgressTitle}>
        {quickFilters.map((item) => {
          const active = (filters.quick ?? "") === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              disabled={pending}
              onClick={() => navigate({ quick: item.value || undefined, status: undefined, drafts: false })}
              className={active
                ? "min-h-9 rounded-full bg-[var(--color-blue)] px-4 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(114,160,193,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
                : "min-h-9 rounded-full border border-[rgba(114,160,193,0.2)] bg-white/72 px-4 text-xs font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
              }
            >{item.label}</button>
          );
        })}
      </div>

      <form noValidate onSubmit={submit} className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search aria-hidden size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
          <input type="search" value={q} onChange={(event) => setQ(event.target.value)} aria-label={adminT.scoring.jurySearch} placeholder={adminT.scoring.jurySearch} className={`${dashboardInputClass} pl-9 pr-10`} />
          {q ? <button type="button" aria-label={adminT.filters.clearAll} onClick={() => { setQ(""); navigate({ q: "" }); }} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"><X aria-hidden size={14} /></button> : null}
        </div>
        <IbpaDropdown value={filters.status ?? ""} onChange={(value) => navigate({ status: value || undefined })} ariaLabel={adminT.scoring.juryStatus} options={[
          { value: "", label: adminT.scoring.juryStatus },
          ...["COMPLETE", "IN_PROGRESS", "NOT_STARTED"].map((value) => ({ value, label: adminT.scoring.juryStatuses[value] })),
        ]} />
        <IbpaDropdown value={filters.sort} onChange={(value) => navigate({ sort: value })} ariaLabel={adminT.filters.sortLabel} options={[
          { value: "completion", label: adminT.scoring.sortCompletion },
          { value: "submitted", label: adminT.scoring.sortSubmitted },
          { value: "remaining", label: adminT.scoring.sortRemaining },
          { value: "name", label: adminT.scoring.sortJuryName },
          { value: "activity", label: adminT.scoring.sortLastActivity },
        ]} />
        <IbpaDropdown value={filters.award ?? ""} onChange={(value) => navigate({ award: value || undefined })} ariaLabel={adminT.scoring.selectAward} options={[{ value: "", label: adminT.scoring.selectAward }, ...options.awards.map((item) => ({ value: item.id, label: item.name }))]} />
        <IbpaDropdown value={filters.category ?? ""} onChange={(value) => navigate({ category: value || undefined })} ariaLabel={adminT.scoring.selectCategory} options={[{ value: "", label: adminT.scoring.selectCategory }, ...options.categories.map((item) => ({ value: item.id, label: item.name }))]} />
        <IbpaDropdown value={filters.nomination ?? ""} onChange={(value) => navigate({ nomination: value || undefined })} ariaLabel={adminT.scoring.selectNomination} options={[{ value: "", label: adminT.scoring.selectNomination }, ...options.nominations.map((item) => ({ value: item.id, label: item.label }))]} />
        <div className="flex h-11 items-center gap-2 rounded-[18px] border border-[rgba(114,160,193,0.22)] bg-white/74 px-3">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">{adminT.scoring.completionRange}</span>
          <input type="number" min={0} max={100} value={min} onChange={(event) => setMin(event.target.value)} aria-label={`${adminT.scoring.completionRange} ${adminT.scoring.filtersScoreFrom}`} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          <span aria-hidden>–</span>
          <input type="number" min={0} max={100} value={max} onChange={(event) => setMax(event.target.value)} aria-label={`${adminT.scoring.completionRange} ${adminT.scoring.filtersScoreTo}`} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white/66 px-4 text-sm text-[var(--color-ink-soft)]">
          <input type="checkbox" checked={filters.unfinished} onChange={(event) => navigate({ unfinished: event.target.checked })} className="size-4 accent-[var(--color-blue)]" />
          {adminT.scoring.hasUnfinished}
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white/66 px-4 text-sm text-[var(--color-ink-soft)]">
          <input type="checkbox" checked={filters.drafts} onChange={(event) => navigate({ drafts: event.target.checked })} className="size-4 accent-[var(--color-blue)]" />
          {adminT.scoring.hasDrafts}
        </label>
        <div className="flex flex-wrap gap-2 md:col-span-2 xl:justify-end">
          {(q !== filters.q || min !== String(filters.min) || max !== String(filters.max)) ? <DashboardPrimaryBtn type="submit" disabled={pending}>{adminT.filters.apply}</DashboardPrimaryBtn> : null}
          {(filters.q || filters.status || filters.award || filters.category || filters.nomination || filters.min > 0 || filters.max < 100 || filters.unfinished || filters.drafts || filters.quick || filters.sort !== "completion") ? <DashboardSecondaryBtn type="button" disabled={pending} onClick={() => { setQ(""); setMin("0"); setMax("100"); navigate({}, true); }}>{adminT.filters.clearAll}</DashboardSecondaryBtn> : null}
        </div>
      </form>
    </DashboardCard>
  );
}
