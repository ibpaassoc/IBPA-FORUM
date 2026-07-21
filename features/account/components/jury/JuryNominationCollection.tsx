import Link from "next/link";
import { CheckCircle2, ClipboardList } from "lucide-react";
import type { JuryNominationFilter, JuryNominationListItem } from "@/features/jury/server/reviews";
import JuryNominationCard from "@/features/account/components/jury/JuryNominationCard";
import { EmptyState } from "@/shared/components/admin/DashboardUI";

const statusFilters: Array<{ value: JuryNominationFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

function buildHref({
  basePath,
  category,
  status,
}: {
  basePath: string;
  category?: string;
  status?: JuryNominationFilter;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (status && status !== "all") params.set("status", status);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function JuryNominationCollection({
  title,
  eyebrow,
  description,
  nominations,
  expertiseAreas,
  activeCategory,
  activeStatus,
  basePath = "/account/jury/nominations",
  showStatusFilters = true,
}: {
  title: string;
  eyebrow: string;
  description: string;
  nominations: JuryNominationListItem[];
  expertiseAreas: string[];
  activeCategory?: string;
  activeStatus: JuryNominationFilter;
  basePath?: string;
  showStatusFilters?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header className="rounded-[30px] border border-[rgba(114,160,193,0.2)] bg-white/76 p-5 shadow-[0_20px_60px_rgba(37,42,45,0.07)] backdrop-blur-2xl sm:p-7">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">{eyebrow}</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-[var(--font-title-family)] text-[clamp(2rem,4vw,3.2rem)] font-light leading-tight tracking-[-0.035em] text-[var(--color-ink)]">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)]">{description}</p>
          </div>
          <div className="shrink-0 rounded-[22px] border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-5 py-3 text-right">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-soft)]">Showing</p>
            <p className="mt-1 font-[var(--font-title-family)] text-3xl font-light leading-none text-[var(--color-ink)]">{nominations.length}</p>
          </div>
        </div>
      </header>

      <section aria-label="Nomination filters" className="rounded-[26px] border border-[rgba(37,42,45,0.08)] bg-white/66 p-3 shadow-[0_12px_34px_rgba(37,42,45,0.045)] backdrop-blur-xl">
        {showStatusFilters ? (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {statusFilters.map((filter) => {
              const active = activeStatus === filter.value;
              return (
                <Link key={filter.value} href={buildHref({ basePath, category: activeCategory, status: filter.value })} aria-current={active ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-[0.66rem] font-semibold uppercase tracking-[0.1em] transition ${active ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white shadow-[0_10px_24px_rgba(114,160,193,0.22)]" : "border-[rgba(114,160,193,0.18)] bg-white/78 text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]"}`}>{filter.label}</Link>
              );
            })}
          </div>
        ) : null}

        {expertiseAreas.length > 1 ? (
          <div className={`${showStatusFilters ? "mt-3 border-t border-[rgba(37,42,45,0.08)] pt-3" : ""} flex gap-2 overflow-x-auto no-scrollbar`}>
            <Link href={buildHref({ basePath, status: activeStatus })} aria-current={!activeCategory ? "page" : undefined} className={`inline-flex min-h-9 shrink-0 items-center rounded-full px-3.5 text-[0.66rem] font-semibold transition ${!activeCategory ? "bg-[var(--color-blue-wash)] text-[#356f98]" : "text-[var(--color-ink-soft)] hover:bg-white"}`}>All expertise</Link>
            {expertiseAreas.map((area) => <Link key={area} href={buildHref({ basePath, category: area, status: activeStatus })} aria-current={activeCategory === area ? "page" : undefined} className={`inline-flex min-h-9 shrink-0 items-center rounded-full px-3.5 text-[0.66rem] font-semibold transition ${activeCategory === area ? "bg-[var(--color-blue-wash)] text-[#356f98]" : "text-[var(--color-ink-soft)] hover:bg-white"}`}>{area}</Link>)}
          </div>
        ) : null}
      </section>

      {nominations.length === 0 ? (
        <EmptyState icon={activeStatus === "completed" ? <CheckCircle2 size={20} /> : <ClipboardList size={20} />} title="No nominations in this view" description="Try another status or expertise filter." />
      ) : (
        <div className="grid gap-3">{nominations.map((nomination) => <JuryNominationCard key={nomination.id} nomination={nomination} />)}</div>
      )}
    </div>
  );
}
