"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Children } from "react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ComponentType,
  FormEvent,
  ReactNode,
} from "react";
import clsx from "clsx";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";

const IBPA_BLUE = "#72a0c1";
const IBPA_BLUE_DEEP = "#4d86ad";
const IBPA_BLUE_SOFT = "#b9d9eb";
const IBPA_BLUE_WASH = "#f2f8fb";
const IBPA_INK = "#030213";
const IBPA_MUTED = "#46525a";

type IconType = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "purple";

const ease = PUBLIC_MOTION_EASE;

function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

const glassBase =
  "relative overflow-hidden border border-[rgba(114,160,193,0.18)] bg-white/76 text-[var(--color-ink)] shadow-[0_22px_70px_rgba(37,42,45,0.075)] backdrop-blur-2xl";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]";

export function DashboardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_14%,rgba(185,217,235,0.36),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(114,160,193,0.18),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f7f9fb_48%,#ffffff_100%)] text-[var(--color-ink)]",
        className,
      )}
    >
      {children}
    </div>
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
    <section className={cn("space-y-4", className)}>
      {title ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="font-[var(--font-accent-family)] text-[0.9rem] italic tracking-[0.03em] text-[var(--color-blue)]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 font-[var(--font-title-family)] text-[clamp(1.6rem,3vw,2.5rem)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]">
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
  tone = "white",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  tone?: "white" | "blue" | "plain";
}) {
  const shouldReduceMotion = useReducedMotion();
  const classes = cn(
    glassBase,
    "rounded-[28px]",
    tone === "blue" &&
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(185,217,235,0.34))]",
    tone === "plain" && "bg-white shadow-[0_18px_48px_rgba(37,42,45,0.06)]",
    className,
  );

  if (hover && !shouldReduceMotion) {
    return (
      <motion.section
        className={classes}
        whileHover={{ y: -4, scale: 1.006 }}
        transition={{ duration: 0.45, ease }}
      >
        {children}
      </motion.section>
    );
  }

  return <section className={classes}>{children}</section>;
}

export function FloatingPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-[30px] border border-[rgba(114,160,193,0.2)] bg-white/82 p-4 shadow-[0_28px_80px_rgba(37,42,45,0.09)] backdrop-blur-2xl",
        className,
      )}
    >
      {children}
    </aside>
  );
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  target?: string;
  rel?: string;
};

function buttonClass(variant: "primary" | "secondary" | "danger" | "ghost", extra?: string) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "border border-[var(--color-blue)] bg-[var(--color-blue)] text-white shadow-[0_14px_34px_rgba(114,160,193,0.32)] hover:-translate-y-0.5 hover:bg-[#4d86ad] hover:shadow-[0_18px_44px_rgba(114,160,193,0.38)]",
    secondary:
      "border border-[rgba(114,160,193,0.22)] bg-white/78 text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]",
    danger:
      "border border-red-200 bg-white text-red-700 shadow-[0_10px_26px_rgba(153,27,27,0.07)] hover:-translate-y-0.5 hover:bg-red-50",
    ghost:
      "border border-transparent bg-transparent text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
  };

  return cn(base, focusRing, variants[variant], extra);
}

function ButtonBase({
  variant,
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className,
  target,
  rel,
}: ButtonProps & { variant: "primary" | "secondary" | "danger" | "ghost" }) {
  const classNames = buttonClass(variant, className);

  if (href) {
    return (
      <Link href={href} className={classNames} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classNames}
    >
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

export function DangerButton(props: ButtonProps) {
  return <ButtonBase {...props} variant="danger" />;
}

export function IconButton({
  label,
  icon: Icon = MoreHorizontal,
  className,
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon?: IconType;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]",
        focusRing,
        className,
      )}
      {...buttonProps}
    >
      <Icon aria-hidden size={17} strokeWidth={1.8} />
    </button>
  );
}

export function DashboardHeader({
  label,
  title,
  description,
  actions,
  meta,
  className,
}: {
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Wrapper = shouldReduceMotion ? "div" : motion.div;
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.55, ease },
      };

  return (
    <Wrapper
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...motionProps}
    >
      <div className="min-w-0">
        {label ? (
          <p className="font-[var(--font-accent-family)] text-[clamp(0.95rem,1.6vw,1.15rem)] italic tracking-[0.03em] text-[var(--color-blue)]">
            {label}
          </p>
        ) : null}
        <h1 className="mt-1 max-w-[12ch] font-[var(--font-title-family)] text-[clamp(2.35rem,7vw,5.4rem)] font-light leading-[0.92] tracking-[-0.025em] text-[var(--color-ink)] md:max-w-[16ch]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl font-[var(--font-body-family)] text-[0.96rem] leading-[1.75] text-[var(--color-ink-soft)]">
            {description}
          </p>
        ) : null}
        {meta ? <div className="mt-4">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </Wrapper>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  accent: tone = "blue",
  icon: Icon,
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent?: BadgeTone;
  icon?: IconType;
  className?: string;
}) {
  const toneClasses: Record<BadgeTone, string> = {
    neutral: "text-[var(--color-ink-soft)] bg-white",
    blue: "text-[var(--color-blue)] bg-[var(--color-blue-wash)]",
    green: "text-emerald-700 bg-emerald-50",
    amber: "text-[var(--color-blue)] bg-[rgba(114,160,193,0.12)]",
    red: "text-red-700 bg-red-50",
    purple: "text-[var(--color-blue)] bg-[var(--color-blue-wash)]",
  };

  return (
    <GlassCard className={cn("p-4 sm:p-5", className)} hover>
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[12rem] text-[0.66rem] font-semibold uppercase leading-[1.35] tracking-[0.17em] text-[var(--color-ink-soft)]">
          {label}
        </p>
        {Icon ? (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              toneClasses[tone],
            )}
          >
            <Icon aria-hidden size={17} strokeWidth={1.8} />
          </span>
        ) : null}
      </div>
      <p className="mt-4 font-[var(--font-title-family)] text-[clamp(2rem,4.8vw,3.35rem)] font-light leading-none tracking-[-0.035em] text-[var(--color-ink)]">
        {value}
      </p>
      {detail ? (
        <div className="mt-3 text-[0.8rem] leading-[1.55] text-[var(--color-ink-soft)]">
          {detail}
        </div>
      ) : null}
    </GlassCard>
  );
}

export function StatGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.78fr))]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const badgeTone: Record<BadgeTone, string> = {
    neutral: "border-[rgba(37,42,45,0.1)] bg-white/78 text-[var(--color-ink-soft)]",
    blue: "border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] text-[#356f98]",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-[rgba(114,160,193,0.2)] bg-[rgba(114,160,193,0.1)] text-[#356f98]",
    red: "border-red-200 bg-red-50 text-red-800",
    purple: "border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] text-[#356f98]",
  };

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.11em]",
        badgeTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FilterTabs({
  items,
  className,
}: {
  items: Array<{ label: ReactNode; href: string; active?: boolean }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto rounded-[24px] border border-[rgba(114,160,193,0.16)] bg-white/62 p-1.5 shadow-[0_12px_34px_rgba(37,42,45,0.045)] backdrop-blur-xl no-scrollbar",
        className,
      )}
    >
      {items.map((item, index) => (
        <Link
          key={`${item.href}-${index}`}
          href={item.href}
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center justify-center rounded-[18px] px-4 text-[0.72rem] font-semibold uppercase tracking-[0.1em] transition",
            focusRing,
            item.active
              ? "bg-[var(--color-blue)] text-white shadow-[0_12px_24px_rgba(114,160,193,0.26)]"
              : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function SearchBar({
  name = "q",
  defaultValue,
  value,
  onChange,
  placeholder = "Search",
  className,
}: {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{placeholder}</span>
      <Search
        aria-hidden
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
      />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        className={cn(dashboardInputClass, "pl-11")}
      />
    </label>
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
    <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-[rgba(114,160,193,0.28)] bg-white/62 px-5 py-12 text-center shadow-[0_18px_52px_rgba(37,42,45,0.045)] backdrop-blur-xl">
      {icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          {icon}
        </div>
      ) : null}
      <div>
        <p className="font-[var(--font-title-family)] text-[1.35rem] font-light leading-tight text-[var(--color-ink)]">
          {title}
        </p>
        {description ? (
          <p className="mx-auto mt-2 max-w-sm font-[var(--font-body-family)] text-[0.9rem] leading-[1.65] text-[var(--color-ink-soft)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ResponsiveList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-3", className)}>{children}</div>;
}

export function TableCard({
  title,
  headers,
  children,
  className,
}: {
  title?: ReactNode;
  headers?: ReactNode[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("overflow-hidden p-0", className)}>
      {title ? (
        <div className="border-b border-[rgba(37,42,45,0.08)] px-4 py-4 md:px-5">
          {title}
        </div>
      ) : null}
      {headers ? (
        <div
          className="hidden gap-4 border-b border-[rgba(37,42,45,0.08)] bg-white/54 px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)] lg:grid"
          style={{
            gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))`,
          } as CSSProperties}
        >
          {headers.map((header, index) => (
            <span key={index}>{header}</span>
          ))}
        </div>
      ) : null}
      <div className="divide-y divide-[rgba(37,42,45,0.08)]">{children}</div>
    </GlassCard>
  );
}

export function ActionMenu({
  label = "More actions",
  children,
  align = "right",
}: {
  label?: string;
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <details className="group relative">
      <summary
        className={cn(
          "flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/76 text-[var(--color-ink-soft)] shadow-[0_10px_24px_rgba(37,42,45,0.055)] backdrop-blur-xl transition hover:bg-[var(--color-blue-wash)]",
          focusRing,
        )}
        aria-label={label}
        title={label}
      >
        <MoreHorizontal aria-hidden size={17} />
      </summary>
      <div
        className={cn(
          "absolute z-30 mt-2 min-w-48 rounded-[20px] border border-[rgba(114,160,193,0.2)] bg-white/92 p-2 shadow-[0_18px_48px_rgba(37,42,45,0.12)] backdrop-blur-2xl",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        {children}
      </div>
    </details>
  );
}

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(3,2,19,0.22)] p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 cursor-default"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            className="relative max-h-[88vh] w-full max-w-xl overflow-auto rounded-[32px] border border-[rgba(114,160,193,0.22)] bg-white/94 p-5 shadow-[0_28px_90px_rgba(3,2,19,0.2)] backdrop-blur-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 36, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              {title ? (
                <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                  {title}
                </h2>
              ) : (
                <span />
              )}
              <IconButton label="Close" icon={X} onClick={() => onOpenChange(false)} />
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const Modal = Drawer;

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Drawer open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)} title={title}>
      {description ? (
        <p className="font-[var(--font-body-family)] text-sm leading-6 text-[var(--color-ink-soft)]">
          {description}
        </p>
      ) : null}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <SecondaryButton onClick={onCancel}>{cancelLabel}</SecondaryButton>
        <DangerButton onClick={onConfirm}>{confirmLabel}</DangerButton>
      </div>
    </Drawer>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-[var(--color-ink-soft)]">
      <Loader2 aria-hidden size={24} className="animate-spin text-[var(--color-blue)]" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-full bg-[linear-gradient(90deg,rgba(185,217,235,0.22),rgba(255,255,255,0.82),rgba(185,217,235,0.22))]",
        className,
      )}
    />
  );
}

export function AvatarGroup({
  items,
  limit = 4,
}: {
  items: Array<{ name: string; image?: string | null }>;
  limit?: number;
}) {
  const visible = items.slice(0, limit);
  const remaining = Math.max(items.length - visible.length, 0);

  return (
    <div className="flex -space-x-2">
      {visible.map((item) => (
        <div
          key={item.name}
          className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-[var(--color-blue-wash)] text-[0.72rem] font-semibold uppercase text-[var(--color-blue)] shadow-sm"
          title={item.name}
        >
          {item.name.slice(0, 1)}
        </div>
      ))}
      {remaining > 0 ? (
        <div className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-white text-[0.7rem] font-semibold text-[var(--color-ink-soft)] shadow-sm">
          +{remaining}
        </div>
      ) : null}
    </div>
  );
}

export function MobileBottomNavigation({
  items,
  className,
}: {
  items: Array<{
    href: string;
    label: string;
    active?: boolean;
    icon: IconType;
  }>;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "fixed inset-x-3 bottom-3 z-50 rounded-[28px] border border-[rgba(114,160,193,0.2)] bg-white/88 p-1.5 shadow-[0_-18px_50px_rgba(37,42,45,0.1)] backdrop-blur-2xl lg:hidden",
        className,
      )}
      aria-label="Mobile dashboard navigation"
    >
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ href, label, active, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[22px] px-1 text-center text-[0.62rem] font-semibold transition",
              active
                ? "bg-[var(--color-blue)] text-white shadow-[0_10px_24px_rgba(114,160,193,0.3)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
            )}
          >
            <Icon aria-hidden size={18} strokeWidth={active ? 2 : 1.7} />
            <span className="w-full truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function FloatingActionButton({
  label = "Create",
  icon: Icon = Plus,
  onClick,
  href,
  className,
}: {
  label?: string;
  icon?: IconType;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const classes = cn(
    "fixed bottom-[5.75rem] right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[var(--color-blue)] text-white shadow-[0_18px_40px_rgba(114,160,193,0.36)] transition hover:-translate-y-1 hover:bg-[#4d86ad] lg:bottom-7",
    focusRing,
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={classes}>
        <Icon aria-hidden size={22} />
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={classes}>
      <Icon aria-hidden size={22} />
    </button>
  );
}

export function DashboardDetailCard({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/66 p-4 shadow-[0_12px_30px_rgba(37,42,45,0.045)] backdrop-blur-xl",
        className,
      )}
    >
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        {label}
      </p>
      <div className="mt-2 break-words font-[var(--font-body-family)] text-[0.92rem] leading-[1.62] text-[var(--color-ink)]">
        {value}
      </div>
    </div>
  );
}

export function DashboardChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)] px-3 py-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.1em] text-[#356f98]">
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
  const labelColor = tone === "dark" ? "rgba(3,2,19,0.74)" : IBPA_MUTED;
  const trackBg = tone === "dark" ? "rgba(255,255,255,0.72)" : "rgba(3,2,19,0.08)";

  return (
    <div>
      <div
        className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
        style={{ color: labelColor }}
      >
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: trackBg }}>
        <div
          className="h-full rounded-full bg-[var(--color-blue)] transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function DashboardAccentBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassCard
      tone="blue"
      className={cn(
        "p-5 shadow-[0_24px_70px_rgba(114,160,193,0.16)]",
        className,
      )}
    >
      {children}
    </GlassCard>
  );
}

export const dashboardInputClass =
  "h-11 w-full rounded-[18px] border border-[rgba(114,160,193,0.22)] bg-white/74 px-4 text-[0.92rem] leading-none text-[var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_26px_rgba(37,42,45,0.045)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)] disabled:cursor-not-allowed disabled:opacity-65";

export const dashboardSelectClass = `${dashboardInputClass} cursor-pointer`;

export const dashboardTextareaClass =
  "min-h-[132px] w-full rounded-[20px] border border-[rgba(114,160,193,0.22)] bg-white/74 px-4 py-3 text-[0.92rem] leading-6 text-[var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_26px_rgba(37,42,45,0.045)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)] disabled:cursor-not-allowed disabled:opacity-65";

export function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <GlassCard className={cn("p-4 md:p-5", className)}>{children}</GlassCard>;
}

export function DashboardPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/56 p-4 shadow-[0_12px_30px_rgba(37,42,45,0.04)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const DashboardPageHeader = DashboardHeader;
export const DashboardMetricTile = MetricCard;
export const DashboardEmptyState = EmptyState;
export const DashboardBadge = StatusBadge;
export const DashboardPrimaryBtn = PremiumButton;
export const DashboardSecondaryBtn = SecondaryButton;
export const DashboardDangerBtn = DangerButton;

export function DashboardSectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return <DashboardSection eyebrow={eyebrow} title={title} action={action}>{null}</DashboardSection>;
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
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-[18px] border px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition",
        focusRing,
        active
          ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white shadow-[0_12px_24px_rgba(114,160,193,0.26)]"
          : "border-[rgba(114,160,193,0.18)] bg-white/72 text-[var(--color-ink-soft)] hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
      )}
    >
      {children}
    </Link>
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
    <TableCard headers={headers} className={className}>
      {children}
    </TableCard>
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
      className={cn(
        "grid gap-3 px-5 py-4 transition-colors hover:bg-[var(--color-blue-wash)]/62",
        cols ? `lg:grid-cols-[repeat(${cols},minmax(0,1fr))]` : "",
      )}
    >
      {children}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

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
    if (!window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}

export const ink = IBPA_INK;
export const accent = IBPA_BLUE;
export const accentDeep = IBPA_BLUE_DEEP;
export const accentSoft = IBPA_BLUE_SOFT;
export const accentWash = IBPA_BLUE_WASH;

// ─── DashboardStagger ────────────────────────────────────────────────────────
// Stagger-in a row/grid of dashboard cards as they mount.

const staggerContainer = {
  hidden: {},
  visible: (stagger = 0.06) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  }),
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease },
  },
};

export function DashboardStagger({
  children,
  className,
  stagger,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      variants={staggerContainer}
      custom={stagger}
      initial="hidden"
      animate="visible"
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
