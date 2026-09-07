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
  award?: string;
  category?: string;
  nomination?: string;
  status?: string;
};

export default function NominationRankingFilters({
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

  function navigate(next: Partial<Filters>, reset = false) {
    const merged = reset ? { q: "" } : { ...filters, q, ...next };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && !key.startsWith("rank")) params.set(key, value);
    }
    params.set("tab", "rankings");
    if (merged.q?.trim()) params.set("rankQ", merged.q.trim());
    if (merged.award) params.set("rankAward", merged.award);
    if (merged.category) params.set("rankCategory", merged.category);
    if (merged.nomination) params.set("rankNomination", merged.nomination);
    if (merged.status) params.set("rankStatus", merged.status);
    if (searchParams.rankPerPage && searchParams.rankPerPage !== "25") {
      params.set("rankPerPage", searchParams.rankPerPage);
    }
    startTransition(() => router.push(`/admin/scoring?${params.toString()}`));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ q });
  }

  return (
    <DashboardCard>
      <form noValidate onSubmit={submit} className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(230px,1fr)_repeat(4,minmax(150px,0.55fr))_auto]">
        <div className="relative md:col-span-2 xl:col-span-1">
          <Search aria-hidden size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            aria-label={adminT.scoring.rankingSearch}
            placeholder={adminT.scoring.rankingSearch}
            className={`${dashboardInputClass} pl-9 pr-10`}
          />
          {q ? (
            <button
              type="button"
              aria-label={adminT.filters.clearAll}
              onClick={() => {
                setQ("");
                navigate({ q: "" });
              }}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
            >
              <X aria-hidden size={14} />
            </button>
          ) : null}
        </div>
        <IbpaDropdown
          value={filters.award ?? ""}
          onChange={(value) => navigate({ award: value || undefined })}
          ariaLabel={adminT.scoring.selectAward}
          options={[{ value: "", label: adminT.scoring.selectAward }, ...options.awards.map((item) => ({ value: item.id, label: item.name }))]}
        />
        <IbpaDropdown
          value={filters.category ?? ""}
          onChange={(value) => navigate({ category: value || undefined })}
          ariaLabel={adminT.scoring.selectCategory}
          options={[{ value: "", label: adminT.scoring.selectCategory }, ...options.categories.map((item) => ({ value: item.id, label: item.name }))]}
        />
        <IbpaDropdown
          value={filters.nomination ?? ""}
          onChange={(value) => navigate({ nomination: value || undefined })}
          ariaLabel={adminT.scoring.selectNomination}
          options={[{ value: "", label: adminT.scoring.selectNomination }, ...options.nominations.map((item) => ({ value: item.id, label: item.label }))]}
        />
        <IbpaDropdown
          value={filters.status ?? ""}
          onChange={(value) => navigate({ status: value || undefined })}
          ariaLabel={adminT.scoring.rankingStatus}
          options={[
            { value: "", label: adminT.scoring.rankingStatus },
            ...["COMPLETE", "IN_PROGRESS", "NOT_STARTED", "NO_JUDGES"].map((value) => ({ value, label: adminT.scoring.rankingStatuses[value] })),
          ]}
        />
        <div className="flex gap-2 md:col-span-2 xl:col-span-1">
          {q !== filters.q ? <DashboardPrimaryBtn type="submit" disabled={pending}>{adminT.filters.apply}</DashboardPrimaryBtn> : null}
          {(filters.q || filters.award || filters.category || filters.nomination || filters.status) ? (
            <DashboardSecondaryBtn type="button" disabled={pending} onClick={() => { setQ(""); navigate({}, true); }}>
              {adminT.filters.clearAll}
            </DashboardSecondaryBtn>
          ) : null}
        </div>
      </form>
    </DashboardCard>
  );
}
