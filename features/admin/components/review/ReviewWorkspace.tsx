"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { ReviewSectionHeader, type ReviewIcon } from "@/features/admin/components/review/ReviewPrimitives";

export type ReviewTab = {
  key: string;
  label: string;
  icon?: ReviewIcon;
  content: ReactNode;
};

function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

/**
 * Application Review Workspace.
 * - Desktop (lg+): segmented tabs over the main column + a sticky action panel aside.
 * - Mobile: every section stacked vertically with its own header, the action panel
 *   flowing at the bottom, plus an optional fixed bottom action bar.
 *
 * Each tab's content is rendered exactly once; CSS toggles visibility per breakpoint,
 * so there are no duplicate DOM nodes or duplicate form ids.
 */
export default function ReviewWorkspace({
  summary,
  alerts,
  tabs,
  aside,
  mobileBar,
}: {
  summary: ReactNode;
  alerts?: ReactNode;
  tabs: ReviewTab[];
  aside?: ReactNode;
  mobileBar?: ReactNode;
}) {
  const [active, setActive] = useState(tabs[0]?.key ?? "");

  return (
    <div className={cn("flex flex-col gap-5", mobileBar ? "pb-24 lg:pb-0" : undefined)}>
      {summary}
      {alerts}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0">
          {/* Desktop tab bar */}
          <div className="hidden lg:block">
            <div className="flex gap-1 overflow-x-auto rounded-[22px] border border-[rgba(114,160,193,0.16)] bg-white/62 p-1.5 shadow-[0_12px_34px_rgba(37,42,45,0.045)] backdrop-blur-xl no-scrollbar">
              {tabs.map((tab) => {
                const isActive = active === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActive(tab.key)}
                    aria-pressed={isActive}
                    className={cn(
                      "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[16px] px-4 text-[0.72rem] font-semibold uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]",
                      isActive
                        ? "bg-[var(--color-blue)] text-white shadow-[0_12px_24px_rgba(114,160,193,0.26)]"
                        : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
                    )}
                  >
                    {tab.icon ? <tab.icon aria-hidden size={14} /> : null}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sections: stacked on mobile, one-at-a-time on desktop */}
          <div className="flex flex-col gap-5 lg:mt-4 lg:gap-0">
            {tabs.map((tab) => (
              <section
                key={tab.key}
                className={cn("min-w-0 scroll-mt-24", active === tab.key ? "lg:block" : "lg:hidden")}
              >
                <div className="lg:hidden">
                  <ReviewSectionHeader icon={tab.icon}>{tab.label}</ReviewSectionHeader>
                </div>
                <div className="mt-3 lg:mt-0">{tab.content}</div>
              </section>
            ))}
          </div>
        </div>

        {aside ? <aside className="min-w-0 lg:sticky lg:top-5 lg:self-start">{aside}</aside> : null}
      </div>

      {mobileBar}
    </div>
  );
}
