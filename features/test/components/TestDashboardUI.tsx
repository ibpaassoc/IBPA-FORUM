"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ComponentType,
  FormEvent,
  ReactNode,
} from "react";
import clsx from "clsx";

type IconType = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

const consoleVariables = {
  "--color-ink": "#f5f5f4",
  "--color-ink-soft": "#a1a1aa",
  "--color-ink-muted": "#71717a",
  "--color-blue": "#f5f5f4",
  "--color-blue-wash": "rgba(255,255,255,0.06)",
  "--font-title-family": "ui-sans-serif, system-ui, sans-serif",
  "--font-body-family": "ui-sans-serif, system-ui, sans-serif",
  "--font-ui-family": "ui-sans-serif, system-ui, sans-serif",
  "--font-accent-family": "ui-sans-serif, system-ui, sans-serif",
} as CSSProperties;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090a0c]";

export function DashboardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "test-console min-h-screen overflow-hidden bg-[#090a0c] font-sans text-zinc-100",
        className,
      )}
      style={consoleVariables}
    >
      {children}
    </div>
  );
}

export function DashboardHeader({
  label,
  title,
  description,
  actions,
  className,
}: {
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={clsx(
        "flex flex-col gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {label ? (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {label}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-4xl font-sans text-[clamp(2.25rem,6vw,4.7rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function DashboardSection({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("space-y-4", className)}>
      {title ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-zinc-500">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 font-sans text-[clamp(1.35rem,2.5vw,2rem)] font-semibold tracking-[-0.035em] text-white">
              {title}
            </h2>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function GlassCard({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  tone?: "white" | "blue" | "plain";
}) {
  return (
    <section
      className={clsx(
        "relative overflow-hidden rounded-[24px] border border-white/[0.09] bg-white/[0.045] text-zinc-100 shadow-[0_28px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl",
        hover &&
          "transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.065]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function buttonClass(variant: "primary" | "secondary", className?: string) {
  return clsx(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
    focusRing,
    variant === "primary"
      ? "border border-white bg-white text-zinc-950 shadow-[0_12px_34px_rgba(255,255,255,0.16)] hover:bg-zinc-200"
      : "border border-white/[0.12] bg-white/[0.055] text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:border-white/25 hover:bg-white/[0.09]",
    className,
  );
}

function ButtonBase({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className,
  variant,
}: ButtonProps & { variant: "primary" | "secondary" }) {
  const classes = buttonClass(variant, className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function PremiumButton(props: ButtonProps) {
  return <ButtonBase {...props} variant="primary" />;
}

export function SecondaryButton(props: ButtonProps) {
  return <ButtonBase {...props} variant="secondary" />;
}

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "green" | "amber" | "red" | "purple";
  className?: string;
}) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.045] text-zinc-400",
    blue: "border-white/20 bg-white/[0.09] text-white",
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
    purple: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  };
  return (
    <span
      className={clsx(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase leading-none tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon?: IconType;
  detail?: ReactNode;
  accent?: "neutral" | "blue" | "green" | "amber" | "red" | "purple";
  className?: string;
}) {
  return (
    <GlassCard className="p-4 sm:p-5" hover>
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[10rem] text-[0.62rem] font-semibold uppercase leading-4 tracking-[0.16em] text-zinc-500">
          {label}
        </p>
        {Icon ? (
          <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-300">
            <Icon aria-hidden size={16} strokeWidth={1.8} />
          </span>
        ) : null}
      </div>
      <p className="mt-6 font-sans text-4xl font-semibold tracking-[-0.055em] text-white">{value}</p>
    </GlassCard>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/[0.12] bg-white/[0.025] px-5 py-10 text-center">
      {icon ? (
        <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-300">
          {icon}
        </span>
      ) : null}
      <p className="text-base font-semibold text-white">{title}</p>
      {description ? <p className="max-w-sm text-sm leading-6 text-zinc-500">{description}</p> : null}
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-zinc-400">
      <Loader2 aria-hidden className="animate-spin" size={18} />
      {label}
    </div>
  );
}

export const dashboardInputClass =
  "h-11 w-full rounded-[15px] border border-white/[0.1] bg-white/[0.055] px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_28px_rgba(0,0,0,0.18)] outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60";

export const dashboardSelectClass = `${dashboardInputClass} cursor-pointer appearance-none pr-9 [color-scheme:dark]`;

export const dashboardTextareaClass =
  "min-h-32 w-full rounded-[18px] border border-white/[0.1] bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_28px_rgba(0,0,0,0.18)] outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60";

export function NativeConfirmForm({
  children,
  message,
  className,
  action,
}: {
  children: ReactNode;
  message: string;
  className?: string;
  action?: (formData: FormData) => void | Promise<void>;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }
  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-zinc-300 hover:bg-white/10",
        focusRing,
        className,
      )}
      {...props}
    />
  );
}
