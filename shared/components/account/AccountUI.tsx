"use client";

import { useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import clsx from "clsx";
import { AlertTriangle, Check, CheckCircle2, Info } from "lucide-react";

/**
 * Light glassmorphic primitives shared by the applicant account and the
 * admin review workspaces: horizontal section navigation, notice panels,
 * and an accessible light progress bar. All surfaces stay on the white /
 * light-blue palette — no dark navy, no gradients.
 */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]";

// ─── SectionNav ──────────────────────────────────────────────────────────────

export type SectionNavItem = {
  id: string;
  label: string;
  /** Completion state shown next to the label (never color-only). */
  state?: "complete" | "missing" | "none";
};

/**
 * Horizontal, scrollable section navigation with tab semantics. Active
 * section is light-blue, completed sections get a green check, sections
 * with missing required data get an amber dot. Arrow keys move focus.
 */
export function SectionNav({
  items,
  activeId,
  onSelect,
  ariaLabel,
  className,
}: {
  items: SectionNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + delta + items.length) % items.length;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    buttons?.[next]?.focus();
    onSelect(items[next].id);
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        "flex gap-1.5 overflow-x-auto rounded-[24px] border border-[rgba(114,160,193,0.18)] bg-white/66 p-1.5 shadow-[0_12px_34px_rgba(37,42,45,0.05)] backdrop-blur-xl no-scrollbar",
        className,
      )}
    >
      {items.map((item, index) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={clsx(
              "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[18px] px-4 text-[0.72rem] font-semibold uppercase tracking-[0.1em] transition duration-200",
              focusRing,
              active
                ? "bg-[var(--color-blue)] text-white shadow-[0_12px_24px_rgba(114,160,193,0.28)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
            )}
          >
            {item.state === "complete" ? (
              <span
                className={clsx(
                  "flex size-4 items-center justify-center rounded-full",
                  active ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-700",
                )}
              >
                <Check aria-hidden size={11} strokeWidth={3} />
              </span>
            ) : null}
            {item.state === "missing" ? (
              <span
                aria-hidden
                className={clsx(
                  "size-2 rounded-full",
                  active ? "bg-white/80" : "bg-amber-500/80 shadow-[0_0_8px_rgba(217,119,6,0.4)]",
                )}
              />
            ) : null}
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── NoticePanel ─────────────────────────────────────────────────────────────

export type NoticeTone = "warning" | "success" | "info" | "error";

const noticeToneClasses: Record<NoticeTone, { panel: string; icon: string }> = {
  warning: {
    panel: "border-amber-200/80 bg-[rgba(254,249,231,0.82)] text-[#7a5b12]",
    icon: "bg-amber-100 text-amber-700",
  },
  success: {
    panel: "border-emerald-200/80 bg-[rgba(236,253,245,0.82)] text-emerald-900",
    icon: "bg-emerald-100 text-emerald-700",
  },
  info: {
    panel: "border-[rgba(114,160,193,0.26)] bg-[var(--color-blue-wash)]/90 text-[#2d5f84]",
    icon: "bg-[rgba(114,160,193,0.16)] text-[var(--color-blue)]",
  },
  error: {
    panel: "border-red-200/85 bg-[rgba(254,242,242,0.85)] text-red-900",
    icon: "bg-red-100 text-red-700",
  },
};

const noticeToneIcon: Record<NoticeTone, ReactNode> = {
  warning: <AlertTriangle aria-hidden size={15} />,
  success: <CheckCircle2 aria-hidden size={15} />,
  info: <Info aria-hidden size={15} />,
  error: <AlertTriangle aria-hidden size={15} />,
};

/** Frosted notice card for warnings, successes, hints, and errors. */
export function NoticePanel({
  tone,
  title,
  children,
  className,
  role,
}: {
  tone: NoticeTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  const classes = noticeToneClasses[tone];

  return (
    <div
      role={role}
      className={clsx(
        "rounded-[22px] border p-4 shadow-[0_14px_36px_rgba(37,42,45,0.05)] backdrop-blur-xl",
        classes.panel,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={clsx(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            classes.icon,
          )}
        >
          {noticeToneIcon[tone]}
        </span>
        <div className="min-w-0 flex-1 pt-1">
          {title ? <p className="text-sm font-semibold leading-snug">{title}</p> : null}
          {children ? (
            <div className={clsx("text-[0.84rem] leading-relaxed", title && "mt-1.5")}>
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── GlassProgressBar ────────────────────────────────────────────────────────

/** Accessible light progress bar with a blue fill on a soft track. */
export function GlassProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(Math.round(value), 100));

  return (
    <div className={clsx("min-w-0", className)}>
      <div className="flex items-center justify-between text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        <span>{label}</span>
        <span className="text-[var(--color-ink)]">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped}%`}
        className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(114,160,193,0.14)] shadow-[inset_0_1px_2px_rgba(37,42,45,0.08)]"
      >
        <div
          className="h-full rounded-full bg-[var(--color-blue)] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
