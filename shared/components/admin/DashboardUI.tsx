"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// ─── Color tokens ────────────────────────────────────────────────────────────
// bg:      #F4F7FB   (page background)
// ink:     #10203B   (headings, primary text, buttons)
// accent:  #4C7D9D   (labels, icons, secondary)
// card:    #ffffff   (card surface)
// border:  slate-200

// ─── Layout shell ────────────────────────────────────────────────────────────

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-24 lg:pb-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </div>
    </div>
  );
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] md:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function DashboardMetricTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  accent?: "blue" | "green" | "amber" | "red";
}) {
  const accentMap = {
    blue: "text-[#4C7D9D]",
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${accent ? accentMap[accent] : "text-[#10203B]"}`}>
        {value}
      </p>
    </div>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

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
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
            {eyebrow}
          </p>
        )}
        <h2 className={`text-lg font-semibold tracking-tight text-[#10203B] ${eyebrow ? "mt-1" : ""}`}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

export function DashboardPrimaryBtn({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-2xl bg-[#10203B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a3157] disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function DashboardSecondaryBtn({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#4C7D9D]/40 hover:text-[#10203B] disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function DashboardDangerBtn({
  children,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Filter chips ─────────────────────────────────────────────────────────────

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
      className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-[#10203B] bg-[#10203B] text-white shadow-[0_10px_24px_rgba(16,32,59,0.14)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-[#4C7D9D]/40 hover:text-[#10203B]"
      }`}
    >
      {children}
    </Link>
  );
}

// ─── Status badges ───────────────────────────────────────────────────────────

type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "purple";

const badgeToneClasses: Record<BadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  purple: "border-purple-200 bg-purple-50 text-purple-700",
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
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] ${badgeToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

// ─── Data table ───────────────────────────────────────────────────────────────

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
    <div className={`overflow-hidden rounded-[20px] border border-slate-200 ${className}`}>
      <div className="hidden grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4C7D9D] lg:grid"
        style={{ "--cols": headers.length } as React.CSSProperties}
      >
        {headers.map((h, i) => <span key={i}>{h}</span>)}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
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
      className={`grid gap-3 px-4 py-4 transition-colors ${href ? "hover:bg-slate-50/80" : ""} ${cols ? `lg:grid-cols-[repeat(${cols},minmax(0,1fr))]` : ""}`}
    >
      {children}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── Form inputs ─────────────────────────────────────────────────────────────

export const dashboardInputClass =
  "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-sm text-[#10203B] outline-none transition focus:border-[#4C7D9D] focus:ring-2 focus:ring-[#4C7D9D]/10";

export const dashboardSelectClass = dashboardInputClass + " cursor-pointer";

export const dashboardTextareaClass =
  "min-h-[140px] w-full rounded-[20px] border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-[#10203B] outline-none transition focus:border-[#4C7D9D] focus:ring-2 focus:ring-[#4C7D9D]/10";

// ─── Empty state ─────────────────────────────────────────────────────────────

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
    <div className="flex flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#4C7D9D]">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-[#10203B]">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  );
}

// ─── Detail card (label + value) ─────────────────────────────────────────────

export function DashboardDetailCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#10203B]">{value}</p>
    </div>
  );
}

// ─── Expertise chip ───────────────────────────────────────────────────────────

export function DashboardChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-[#4C7D9D]/20 bg-[#E9F1F8] px-2.5 py-0.5 text-[11px] font-semibold text-[#4C7D9D]">
      {children}
    </span>
  );
}
