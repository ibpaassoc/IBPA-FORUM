"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export type NominationBrowserItem = {
  id: string;
  awardName: string;
  categoryName: string;
  /** Small server-rendered badges (status, files count, …). */
  meta?: ReactNode;
  /** The selected nomination's full content (answers + files). */
  content: ReactNode;
};

/**
 * Admin nomination workspace: a compact selector of the applicant's
 * purchased nominations with exactly one nomination's content shown at a
 * time. Every item is rendered once; CSS visibility keeps the DOM stable
 * so file links and forms inside keep working.
 */
export default function AdminNominationBrowser({
  items,
  listLabel,
}: {
  items: NominationBrowserItem[];
  listLabel: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  if (items.length === 0) return null;
  if (items.length === 1) return <div>{items[0].content}</div>;

  return (
    <div className="flex flex-col gap-4">
      <nav
        aria-label={listLabel}
        className="grid gap-2 rounded-[24px] border border-[rgba(114,160,193,0.18)] bg-white/66 p-2 shadow-[0_12px_34px_rgba(37,42,45,0.05)] backdrop-blur-xl sm:grid-cols-2 xl:grid-cols-3"
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveId(item.id)}
              className={`flex min-h-[64px] items-center justify-between gap-2 rounded-[18px] border px-3.5 py-2.5 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] ${
                active
                  ? "border-[var(--color-blue)]/55 bg-[var(--color-blue-wash)] shadow-[0_12px_28px_rgba(114,160,193,0.16)]"
                  : "border-transparent bg-white/55 hover:border-[rgba(114,160,193,0.3)] hover:bg-[var(--color-blue-wash)]/60"
              }`}
            >
              <span className="min-w-0">
                <span
                  className={`block truncate text-sm font-semibold ${
                    active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"
                  }`}
                >
                  {item.awardName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-[var(--color-ink-muted)]">
                  {item.categoryName}
                </span>
                {item.meta ? (
                  <span className="mt-1.5 flex flex-wrap gap-1">{item.meta}</span>
                ) : null}
              </span>
              <ChevronRight
                aria-hidden
                size={15}
                className={`shrink-0 transition ${
                  active ? "text-[var(--color-blue)]" : "text-[var(--color-ink-muted)]"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {items.map((item) => (
        <div key={item.id} className={item.id === activeId ? "min-w-0" : "hidden"}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
