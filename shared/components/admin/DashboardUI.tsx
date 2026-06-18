"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const ink = "#0A0A0A";
const accent = "#7DC8EE";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white pb-24 text-[#0A0A0A] lg:pb-0">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 lg:py-7">
        {children}
      </div>
    </div>
  );
}

export function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-black/10 bg-white p-4 shadow-[0_18px_50px_rgba(10,10,10,0.06)] md:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function DashboardPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-black/10 bg-[#FAFAFA] p-4 ${className}`}>
      {children}
    </div>
  );
}

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
    <div className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {label ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#347DA5]">
            {label}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-4xl text-3xl font-semibold normal-case leading-tight tracking-[-0.02em] text-[#0A0A0A] md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60 md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function DashboardMetricTile({
  label,
  value,
  accent: tone,
}: {
  label: string;
  value: ReactNode;
  accent?: "blue" | "green" | "amber" | "red";
}) {
  const toneClass = {
    blue: "text-[#1673A5]",
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
  }[tone ?? "blue"];

  return (
    <div className="rounded-lg border border-black/10 bg-[#FAFAFA] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-[-0.02em] ${tone ? toneClass : "text-[#0A0A0A]"}`}>
        {value}
      </p>
    </div>
  );
}

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#347DA5]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`text-lg font-semibold normal-case tracking-[-0.01em] text-[#0A0A0A] ${eyebrow ? "mt-1" : ""}`}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function buttonClass(kind: "primary" | "secondary" | "danger", className: string) {
  const shared =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold leading-none transition disabled:cursor-not-allowed disabled:opacity-60";

  if (kind === "primary") {
    return `${shared} bg-[#0A0A0A] text-white hover:bg-black ${className}`;
  }

  if (kind === "danger") {
    return `${shared} border border-red-200 bg-white text-red-700 hover:bg-red-50 ${className}`;
  }

  return `${shared} border border-black/10 bg-white text-[#0A0A0A] hover:border-[#7DC8EE] hover:bg-[#EAF6FF] ${className}`;
}

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
  const cls = buttonClass("primary", className);
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
  const cls = buttonClass("secondary", className);
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
      className={buttonClass("danger", className)}
    >
      {children}
    </button>
  );
}

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
      className={`inline-flex min-h-9 items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-[#7DC8EE] bg-[#EAF6FF] text-[#0A0A0A]"
          : "border-black/10 bg-white text-black/60 hover:border-[#7DC8EE] hover:bg-[#EAF6FF] hover:text-[#0A0A0A]"
      }`}
    >
      {children}
    </Link>
  );
}

type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "purple";

const badgeToneClasses: Record<BadgeTone, string> = {
  neutral: "border-black/10 bg-[#F5F5F5] text-black/65",
  blue: "border-[#7DC8EE] bg-[#EAF6FF] text-[#0A0A0A]",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
  purple: "border-[#7DC8EE] bg-[#EAF6FF] text-[#0A0A0A]",
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
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.08em] ${badgeToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

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
    <div className={`overflow-hidden rounded-lg border border-black/10 ${className}`}>
      <div
        className="hidden gap-4 border-b border-black/10 bg-[#FAFAFA] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45 lg:grid"
        style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` } as CSSProperties}
      >
        {headers.map((header, index) => (
          <span key={index}>{header}</span>
        ))}
      </div>
      <div className="divide-y divide-black/10">{children}</div>
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
      className={`grid gap-3 px-4 py-4 transition-colors ${href ? "hover:bg-[#EAF6FF]/45" : ""} ${cols ? `lg:grid-cols-[repeat(${cols},minmax(0,1fr))]` : ""}`}
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

export const dashboardInputClass =
  "h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-[#0A0A0A] outline-none transition placeholder:text-black/35 focus:border-[#7DC8EE] focus:ring-4 focus:ring-[#EAF6FF]";

export const dashboardSelectClass = `${dashboardInputClass} cursor-pointer`;

export const dashboardTextareaClass =
  "min-h-[128px] w-full rounded-md border border-black/10 bg-white px-3 py-3 text-sm leading-6 text-[#0A0A0A] outline-none transition placeholder:text-black/35 focus:border-[#7DC8EE] focus:ring-4 focus:ring-[#EAF6FF]";

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
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-black/15 bg-[#FAFAFA] px-5 py-10 text-center">
      {icon ? (
        <div className="flex size-11 items-center justify-center rounded-md bg-[#EAF6FF] text-[#1673A5]">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-[#0A0A0A]">{title}</p>
      {description ? <p className="max-w-sm text-sm leading-6 text-black/55">{description}</p> : null}
    </div>
  );
}

export function DashboardDetailCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-[#FAFAFA] p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">{label}</p>
      <p className="mt-2 break-words text-sm leading-6 text-[#0A0A0A]">{value}</p>
    </div>
  );
}

export function DashboardChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[#7DC8EE] bg-[#EAF6FF] px-2.5 py-1 text-[11px] font-semibold leading-none text-[#0A0A0A]">
      {children}
    </span>
  );
}

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
  const labelClass = tone === "dark" ? "text-white/55" : "text-black/45";
  const trackClass = tone === "dark" ? "bg-white/10" : "bg-black/10";

  return (
    <div>
      <div className={`flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}>
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className={`mt-2 h-2 rounded-full ${trackClass}`}>
        <div
          className="h-2 rounded-full bg-[#7DC8EE]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function DashboardAccentBlock({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-black bg-[#0A0A0A] p-4 text-white ${className}`}>
      {children}
    </div>
  );
}

export { accent, ink };
