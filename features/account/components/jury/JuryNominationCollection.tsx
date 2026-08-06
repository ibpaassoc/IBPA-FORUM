import Link from "next/link";
import clsx from "clsx";
import { CheckCircle2, ClipboardList } from "lucide-react";
import type { JuryNominationFilter, JuryNominationListItem } from "@/features/jury/server/reviews";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import JuryNominationCard from "@/features/account/components/jury/JuryNominationCard";
import { getServerTranslations } from "@/lib/i18n/server";
import { DashboardStagger, EmptyState } from "@/shared/components/admin/DashboardUI";

const statusFilterOrder: Array<{ value: JuryNominationFilter; statusKey: string }> = [
  { value: "all", statusKey: "" },
  { value: "pending", statusKey: "NOT_STARTED" },
  { value: "in-progress", statusKey: "IN_PROGRESS" },
  { value: "completed", statusKey: "COMPLETED" },
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

const pillBase =
  "inline-flex min-h-10 shrink-0 items-center justify-center rounded-[18px] px-4 text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]";
const pillActive =
  "bg-[var(--color-blue)] text-white shadow-[0_12px_24px_rgba(114,160,193,0.28)]";
const pillIdle =
  "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]";

/**
 * Shared list surface for the jury queue and the completed-review archive.
 * Filters are plain links so the list stays a server component and the URL
 * remains shareable.
 */
export default async function JuryNominationCollection({
  variant,
  nominations,
  approvedCategories,
  activeCategory,
  activeStatus,
  basePath = "/account/jury/nominations",
  showStatusFilters = true,
}: {
  variant: "queue" | "completed";
  nominations: JuryNominationListItem[];
  approvedCategories: string[];
  activeCategory?: string;
  activeStatus: JuryNominationFilter;
  basePath?: string;
  showStatusFilters?: boolean;
}) {
  const t = await getServerTranslations();
  const list = t.account.jury.list;
  const completedView = variant === "completed";
  const showCategoryFilters = approvedCategories.length > 1;

  return (
    <div className="flex flex-col gap-5">
      <AccountPageHeader
        eyebrow={completedView ? list.completedEyebrow : list.eyebrow}
        title={completedView ? list.completedTitle : list.title}
      />

      {showStatusFilters || showCategoryFilters ? (
        <section
          aria-label={list.filterAria}
          className="flex flex-col gap-1.5 rounded-[24px] border border-[rgba(114,160,193,0.18)] bg-white/66 p-1.5 shadow-[0_12px_34px_rgba(37,42,45,0.05)] backdrop-blur-xl"
        >
          {showStatusFilters ? (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {statusFilterOrder.map((filter) => {
                const active = activeStatus === filter.value;
                return (
                  <Link
                    key={filter.value}
                    href={buildHref({ basePath, category: activeCategory, status: filter.value })}
                    aria-current={active ? "page" : undefined}
                    className={clsx(pillBase, active ? pillActive : pillIdle)}
                  >
                    {filter.statusKey ? t.account.jury.statuses[filter.statusKey] : list.filterAll}
                  </Link>
                );
              })}
            </div>
          ) : null}

          {showCategoryFilters ? (
            <div
              className={clsx(
                "flex gap-1.5 overflow-x-auto no-scrollbar",
                showStatusFilters && "border-t border-[rgba(37,42,45,0.08)] pt-1.5",
              )}
            >
              <Link
                href={buildHref({ basePath, status: activeStatus })}
                aria-current={!activeCategory ? "page" : undefined}
                className={clsx(
                  pillBase,
                  "min-h-9 text-[0.66rem]",
                  !activeCategory ? "bg-[var(--color-blue-wash)] text-[#356f98]" : pillIdle,
                )}
              >
                {list.allCategories}
              </Link>
              {approvedCategories.map((category) => (
                <Link
                  key={category}
                  href={buildHref({ basePath, category, status: activeStatus })}
                  aria-current={activeCategory === category ? "page" : undefined}
                  className={clsx(
                    pillBase,
                    "min-h-9 text-[0.66rem]",
                    activeCategory === category
                      ? "bg-[var(--color-blue-wash)] text-[#356f98]"
                      : pillIdle,
                  )}
                >
                  {category}
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {nominations.length === 0 ? (
        <EmptyState
          icon={completedView ? <CheckCircle2 size={20} /> : <ClipboardList size={20} />}
          title={completedView ? list.completedEmptyTitle : list.emptyTitle}
          description={completedView ? list.completedEmptyText : list.emptyText}
        />
      ) : (
        <DashboardStagger className="grid gap-3">
          {nominations.map((nomination) => (
            <JuryNominationCard key={nomination.id} nomination={nomination} />
          ))}
        </DashboardStagger>
      )}
    </div>
  );
}
