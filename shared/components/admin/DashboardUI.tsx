"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/* ─── Design tokens ─────────────────────────────────────── */
const IBPA_BLUE      = "#72a0c1";
const IBPA_BLUE_DEEP = "#4d86ad";
const IBPA_BLUE_WASH = "#f2f8fb";
const IBPA_BLUE_SOFT = "#b9d9eb";
const IBPA_INK       = "#030213";
const IBPA_MUTED     = "#46525a";

/* ─── Shell ─────────────────────────────────────────────── */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-24 text-[var(--color-ink)] lg:pb-0">
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
      className={`rounded-[14px] border border-black/[0.08] bg-white p-5 shadow-[0_8px_28px_rgba(3,2,19,0.05)] ${className}`}
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
      className={`rounded-[10px] border border-black/[0.07] bg-[#fafaf9] p-4 ${className}`}
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
    <div className="flex flex-col gap-4 border-b border-black/[0.08] pb-6 lg:flex-row lg:items-end lg:justify-between">
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
    <div className="rounded-[12px] border border-black/[0.07] bg-white p-4 shadow-[0_4px_16px_rgba(3,2,19,0.04)]">
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
    return `${base} bg-[${IBPA_BLUE}] text-white border border-[${IBPA_BLUE}] hover:bg-[${IBPA_BLUE_DEEP}] hover:border-[${IBPA_BLUE_DEEP}] shadow-[0_4px_14px_rgba(114,160,193,0.25)] hover:shadow-[0_6px_20px_rgba(114,160,193,0.3)] hover:-translate-y-px ${extra}`;
  }
  if (kind === "danger") {
    return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50 hover:border-red-300 ${extra}`;
  }
  return `${base} border border-black/[0.1] bg-white text-[${IBPA_INK}] hover:border-[${IBPA_BLUE}] hover:bg-[${IBPA_BLUE_WASH}] hover:text-[${IBPA_BLUE_DEEP}] ${extra}`;
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
          ? "border-[#72a0c1] bg-[#f2f8fb] text-[#030213]"
          : "border-black/[0.08] bg-white text-black/50 hover:border-[#72a0c1] hover:bg-[#f2f8fb] hover:text-[#030213]"
      }`}
    >
      {children}
    </Link>
  );
}

/* ─── Badge ──────────────────────────────────────────────── */
type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "purple";

const badgeTone: Record<BadgeTone, string> = {
  neutral: "border-black/10 bg-[#f5f5f5] text-black/60",
  blue:    "border-[#b9d9eb] bg-[#f2f8fb] text-[#2d6080]",
  green:   "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber:   "border-amber-200 bg-amber-50 text-amber-800",
  red:     "border-red-200 bg-red-50 text-red-800",
  purple:  "border-[#b9d9eb] bg-[#f2f8fb] text-[#2d6080]",
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
    <div className={`overflow-hidden rounded-[12px] border border-black/[0.08] ${className}`}>
      <div
        className="hidden gap-4 border-b border-black/[0.07] bg-[#fafaf9] px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-black/40 lg:grid"
        style={{
          gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))`,
          fontFamily: "var(--font-ui-family)",
        } as CSSProperties}
      >
        {headers.map((header, i) => <span key={i}>{header}</span>)}
      </div>
      <div className="divide-y divide-black/[0.06]">{children}</div>
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
      className={`grid gap-3 px-5 py-4 transition-colors ${href ? "hover:bg-[#f2f8fb]/60" : ""} ${cols ? `lg:grid-cols-[repeat(${cols},minmax(0,1fr))]` : ""}`}
    >
      {children}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

/* ─── Form inputs ────────────────────────────────────────── */
export const dashboardInputClass =
  "h-10 w-full rounded-[8px] border border-black/[0.1] bg-white px-3.5 text-sm leading-none text-[#030213] outline-none transition placeholder:text-black/30 focus:border-[#72a0c1] focus:ring-4 focus:ring-[#f2f8fb]";

export const dashboardSelectClass = `${dashboardInputClass} cursor-pointer`;

export const dashboardTextareaClass =
  "min-h-[128px] w-full rounded-[8px] border border-black/[0.1] bg-white px-3.5 py-3 text-sm leading-6 text-[#030213] outline-none transition placeholder:text-black/30 focus:border-[#72a0c1] focus:ring-4 focus:ring-[#f2f8fb]";

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
    <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-black/[0.12] bg-[#fafaf9] px-5 py-12 text-center">
      {icon ? (
        <div
          className="flex size-11 items-center justify-center rounded-full border border-[#b9d9eb] bg-[#f2f8fb]"
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
    <div className="rounded-[10px] border border-black/[0.07] bg-[#fafaf9] p-4">
      <p
        className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-black/40"
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
      className="inline-flex items-center rounded-full border border-[#b9d9eb] bg-[#f2f8fb] px-3 py-0.5 text-[0.62rem] font-semibold leading-none tracking-[0.08em] text-[#2d6080]"
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
      className={`rounded-[14px] border border-[#5c8aaa] p-5 text-white ${className}`}
      style={{
        background: "linear-gradient(135deg, #7a98af 0%, #5c8aaa 100%)",
        boxShadow: "0 8px 32px rgba(114,160,193,0.28)",
      }}
    >
      {children}
    </div>
  );
}

export const ink = IBPA_INK;
export const accent = IBPA_BLUE;
