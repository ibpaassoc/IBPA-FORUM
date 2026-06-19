"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/* ─── Design tokens ─────────────────────────────────────── */
const IBPA_BLUE      = "#72a0c1";
const IBPA_BLUE_DEEP = "#4d86ad";
const IBPA_BLUE_SOFT = "#b9d9eb";
const IBPA_INK       = "#030213";
const IBPA_MUTED     = "#46525a";

/* ─── Shell ─────────────────────────────────────────────── */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(185,217,235,0.22),transparent_32%),linear-gradient(180deg,var(--color-white),var(--surface-tint))] pb-24 text-[var(--color-ink)] lg:pb-0">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 lg:py-7">
        {children}
      </div>
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────── */
export function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[18px] border border-[var(--border-default)] bg-white/84 p-5 shadow-[0_18px_50px_rgba(3,2,19,0.06)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

/* ─── Panel (sub-card inside a card) ─────────────────────── */
export function DashboardPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[14px] border border-[var(--border-soft)] bg-white/62 p-4 shadow-[0_10px_28px_rgba(3,2,19,0.04)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Page header ────────────────────────────────────────── */
export function DashboardPageHeader({
  label,
  title,
  description,
  actions,
}: {
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {label ? (
          <p
            className="text-[clamp(0.85rem,1.1vw,0.95rem)] italic tracking-wide"
            style={{ fontFamily: "var(--font-accent)", color: IBPA_BLUE }}
          >
            {label}
          </p>
        ) : null}
        <h1
          className="mt-1 max-w-4xl text-[clamp(1.9rem,3.5vw,2.8rem)] font-light leading-[1.08] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)", color: IBPA_INK }}
        >
          {title}
        </h1>
        {description ? (
          <p
            className="mt-2 max-w-2xl text-[0.94rem] leading-[1.72]"
            style={{ fontFamily: "var(--font-body)", color: IBPA_MUTED }}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/* ─── Metric tile ────────────────────────────────────────── */
export function DashboardMetricTile({
  label,
  value,
  accent: tone,
}: {
  label: string;
  value: ReactNode;
  accent?: "blue" | "green" | "amber" | "red";
}) {
  const toneColor: Record<string, string> = {
    blue: IBPA_BLUE_DEEP,
    green: "#166534",
    amber: "#92400e",
    red: "#991b1b",
  };
  const valueColor = tone ? toneColor[tone] : IBPA_INK;

  return (
    <div className="rounded-[16px] border border-[var(--border-default)] bg-white/82 p-4 shadow-[0_14px_34px_rgba(3,2,19,0.05)] backdrop-blur-xl">
      <p
        className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: "var(--font-ui-family)", color: IBPA_MUTED }}
      >
        {label}
      </p>
      <p
        className="mt-2 text-[2rem] font-light leading-none tracking-[-0.02em]"
        style={{ fontFamily: "var(--font-display)", color: valueColor }}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────── */
export function DashboardSectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow ? (
          <p
            className="text-[clamp(0.82rem,1vw,0.9rem)] italic"
            style={{ fontFamily: "var(--font-accent)", color: IBPA_BLUE }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`text-[clamp(1.1rem,1.8vw,1.4rem)] font-light leading-[1.1] tracking-[-0.01em] ${eyebrow ? "mt-1" : ""}`}
          style={{ fontFamily: "var(--font-display)", color: IBPA_INK }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* ─── Buttons ────────────────────────────────────────────── */
function buildButtonClass(
  kind: "primary" | "secondary" | "danger",
  extra: string,
) {
  const base =
    "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full px-5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.1em] leading-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  if (kind === "primary") {
    return `${base} border border-[var(--color-blue)] bg-[var(--color-blue)] text-[var(--color-ink)] shadow-[0_10px_24px_rgba(114,160,193,0.22)] hover:border-[var(--color-blue-dark)] hover:bg-[var(--color-blue-soft)] hover:-translate-y-px hover:shadow-[0_14px_34px_rgba(114,160,193,0.28)] ${extra}`;
  }
  if (kind === "danger") {
    return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50 hover:border-red-300 ${extra}`;
  }
  return `${base} border border-[var(--border-default)] bg-white/86 text-[var(--color-ink)] shadow-[0_8px_20px_rgba(3,2,19,0.04)] hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] ${extra}`;
}

type BtnProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

export function DashboardPrimaryBtn({
  children, href, onClick, type = "button", disabled, className = "",
}: BtnProps) {
  const cls = buildButtonClass("primary", className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function DashboardSecondaryBtn({
  children, href, onClick, type = "button", disabled, className = "",
}: BtnProps) {
  const cls = buildButtonClass("secondary", className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function DashboardDangerBtn({
  children, onClick, type = "button", disabled, className = "",
}: Omit<BtnProps, "href">) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buildButtonClass("danger", className)}
    >
      {children}
    </button>
  );
}

/* ─── Filter chip ────────────────────────────────────────── */
export function DashboardFilterChip({
  children,
  href,
  active,
}: {
  children: ReactNode;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[34px] items-center justify-center rounded-full border px-4 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] transition-all duration-200 ${
        active
          ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
          : "border-[var(--border-soft)] bg-white/78 text-[var(--color-ink-soft)] hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]"
      }`}
    >
      {children}
    </Link>
  );
}

/* ─── Badge ──────────────────────────────────────────────── */
type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "purple";

const badgeTone: Record<BadgeTone, string> = {
  neutral: "border-[var(--border-soft)] bg-white/72 text-[var(--color-ink-soft)]",
  blue:    "border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] text-[var(--color-blue-dark)]",
  green:   "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber:   "border-amber-200 bg-amber-50 text-amber-800",
  red:     "border-red-200 bg-red-50 text-red-800",
  purple:  "border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] text-[var(--color-blue-dark)]",
};

export function DashboardBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.1em] ${badgeTone[tone]}`}
      style={{ fontFamily: "var(--font-ui-family)" }}
    >
      {children}
    </span>
  );
}

/* ─── Table ──────────────────────────────────────────────── */
export function DashboardTable({
  headers,
  children,
  className = "",
}: {
  headers: ReactNode[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[16px] border border-[var(--border-default)] bg-white/72 shadow-[0_14px_36px_rgba(3,2,19,0.05)] backdrop-blur-xl ${className}`}>
      <div
        className="hidden gap-4 border-b border-[var(--border-soft)] bg-[var(--surface-tint)]/80 px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)] lg:grid"
        style={{
          gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))`,
          fontFamily: "var(--font-ui-family)",
        } as CSSProperties}
      >
        {headers.map((header, i) => <span key={i}>{header}</span>)}
      </div>
      <div className="divide-y divide-[var(--border-soft)]">{children}</div>
    </div>
  );
}

export function DashboardTableRow({
  children,
  href,
  cols,
}: {
  children: ReactNode;
  href?: string;
  cols?: number;
}) {
  const inner = (
    <div
      className={`grid gap-3 px-5 py-4 transition-colors ${href ? "hover:bg-[var(--color-blue-wash)]/60" : ""} ${cols ? `lg:grid-cols-[repeat(${cols},minmax(0,1fr))]` : ""}`}
    >
      {children}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

/* ─── Form inputs ────────────────────────────────────────── */
export const dashboardInputClass =
  "h-10 w-full rounded-[10px] border border-[var(--border-default)] bg-white/88 px-3.5 text-sm leading-none text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[var(--color-blue-wash)]";

export const dashboardSelectClass = `${dashboardInputClass} cursor-pointer`;

export const dashboardTextareaClass =
  "min-h-[128px] w-full rounded-[10px] border border-[var(--border-default)] bg-white/88 px-3.5 py-3 text-sm leading-6 text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[var(--color-blue-wash)]";

/* ─── Empty state ────────────────────────────────────────── */
export function DashboardEmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[var(--color-blue-soft)] bg-white/64 px-5 py-12 text-center shadow-[0_12px_32px_rgba(3,2,19,0.04)]">
      {icon ? (
        <div
          className="flex size-11 items-center justify-center rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)]"
          style={{ color: IBPA_BLUE }}
        >
          {icon}
        </div>
      ) : null}
      <p
        className="text-[0.95rem] font-light"
        style={{ fontFamily: "var(--font-display)", color: IBPA_INK }}
      >
        {title}
      </p>
      {description ? (
        <p
          className="max-w-sm text-[0.88rem] leading-[1.65]"
          style={{ fontFamily: "var(--font-body)", color: IBPA_MUTED }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/* ─── Detail card ────────────────────────────────────────── */
export function DashboardDetailCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[var(--border-soft)] bg-white/64 p-4 shadow-[0_10px_24px_rgba(3,2,19,0.04)]">
      <p
        className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]"
        style={{ fontFamily: "var(--font-ui-family)" }}
      >
        {label}
      </p>
      <p
        className="mt-1.5 break-words text-[0.92rem] leading-[1.6]"
        style={{ fontFamily: "var(--font-body)", color: IBPA_INK }}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Chip ───────────────────────────────────────────────── */
export function DashboardChip({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] px-3 py-0.5 text-[0.62rem] font-semibold leading-none tracking-[0.08em] text-[var(--color-blue-dark)]"
      style={{ fontFamily: "var(--font-ui-family)" }}
    >
      {children}
    </span>
  );
}

/* ─── KPI progress bar ───────────────────────────────────── */
export function DashboardKpiBar({
  value,
  label,
  tone = "light",
}: {
  value: number;
  label: string;
  tone?: "light" | "dark";
}) {
  const clamped = Math.max(0, Math.min(value, 100));
  const labelColor = tone === "dark" ? "rgba(255,255,255,0.85)" : IBPA_MUTED;
  const trackBg = tone === "dark" ? "rgba(255,255,255,0.15)" : "rgba(3,2,19,0.08)";

  return (
    <div>
      <div
        className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
        style={{ fontFamily: "var(--font-ui-family)", color: labelColor }}
      >
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div
        className="mt-2 h-1.5 rounded-full overflow-hidden"
        style={{ background: trackBg }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, background: IBPA_BLUE_SOFT }}
        />
      </div>
    </div>
  );
}

/* ─── Accent block (jury identity card) ──────────────────── */
export function DashboardAccentBlock({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[var(--color-blue-soft)] p-5 text-[var(--color-ink)] shadow-[0_18px_44px_rgba(114,160,193,0.16)] backdrop-blur-xl ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(185,217,235,0.42) 0%, rgba(255,255,255,0.82) 100%)",
      }}
    >
      {children}
    </div>
  );
}

export const ink = IBPA_INK;
export const accent = IBPA_BLUE;
