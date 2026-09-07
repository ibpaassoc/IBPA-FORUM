import Link from "next/link";
import clsx from "clsx";
import { BarChart3, LayoutDashboard, UsersRound } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";

export type AdminScoringTab = "overview" | "rankings" | "jury-progress";

export function getAdminScoringTab(value?: string): AdminScoringTab {
  if (value === "rankings" || value === "jury-progress") return value;
  return "overview";
}

function tabHref(tab: AdminScoringTab, current: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value && key !== "tab") params.set(key, value);
  }
  if (tab !== "overview") params.set("tab", tab);
  const query = params.toString();
  return query ? `/admin/scoring?${query}` : "/admin/scoring";
}

export default function ScoringNavigation({
  active,
  searchParams,
}: {
  active: AdminScoringTab;
  searchParams: Record<string, string | undefined>;
}) {
  const items = [
    { id: "overview" as const, label: adminT.scoring.tabs.overview, icon: LayoutDashboard },
    { id: "rankings" as const, label: adminT.scoring.tabs.rankings, icon: BarChart3 },
    { id: "jury-progress" as const, label: adminT.scoring.tabs.juryProgress, icon: UsersRound },
  ];

  return (
    <nav aria-label={adminT.scoring.navigationAria} className="overflow-x-auto pb-1">
      <div className="inline-flex min-w-full gap-1 rounded-[22px] border border-[rgba(114,160,193,0.2)] bg-white/72 p-1.5 shadow-[0_14px_34px_rgba(37,42,45,0.05)] backdrop-blur-xl sm:min-w-0">
        {items.map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={tabHref(id, searchParams)}
            aria-current={active === id ? "page" : undefined}
            className={clsx(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[17px] px-4 text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] sm:flex-none",
              active === id
                ? "bg-[var(--color-blue)] text-white shadow-[0_10px_24px_rgba(114,160,193,0.28)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
            )}
          >
            <Icon aria-hidden size={16} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
