import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { PageShell } from "@/shared/components/layout/PageShell";

type AdminDashboardShellProps = {
  children: ReactNode;
  className?: string;
};

type AdminHeroCardProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

type AdminSectionProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

type AdminStatCardProps = {
  label: ReactNode;
  value: ReactNode;
};

type AdminToolbarButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "gold" | "danger";
  disabled?: boolean;
  onClick?: ComponentPropsWithoutRef<"button">["onClick"];
  className?: string;
};

type AdminFilterChipProps = {
  children: ReactNode;
  href: string;
  active?: boolean;
};

type AdminStatusBadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "gold" | "navy" | "success" | "danger" | "muted";
};

type AdminDataTableProps = {
  headers: ReactNode[];
  children: ReactNode;
  gridClassName?: string;
  className?: string;
};

type AdminDataRowProps = {
  children: ReactNode;
  gridClassName?: string;
  href?: string;
};

type AdminEmptyStateProps = {
  title: ReactNode;
  text?: ReactNode;
};

type AdminDetailCardProps = {
  label: ReactNode;
  value: ReactNode;
};

export function adminCn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const buttonVariants = {
  primary: "admin-action-primary",
  secondary: "admin-action-secondary",
  gold: "admin-action-gold",
  danger:
    "border border-[color:var(--admin-border-strong)] bg-[var(--admin-surface)] text-[var(--admin-ink)] hover:border-[var(--admin-gold)] hover:text-[var(--admin-gold-strong)]",
} as const;

const badgeTones = {
  neutral:
    "border-[color:var(--admin-border)] bg-[var(--admin-surface-soft)] text-[var(--admin-slate-strong)]",
  gold:
    "border-[rgba(184,148,83,0.34)] bg-[var(--admin-gold-soft)] text-[var(--admin-gold-strong)]",
  navy:
    "border-[rgba(26,38,64,0.18)] bg-[rgba(26,38,64,0.08)] text-[var(--admin-navy)]",
  success:
    "border-[rgba(184,148,83,0.36)] bg-[rgba(241,231,210,0.86)] text-[var(--admin-navy)]",
  danger:
    "border-[color:var(--admin-danger-border)] bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]",
  muted:
    "border-[color:var(--admin-border)] bg-[rgba(86,101,121,0.08)] text-[var(--admin-slate-strong)]",
} as const;

export function AdminDashboardShell({
  children,
  className,
}: AdminDashboardShellProps) {
  return (
    <PageShell className={adminCn("admin-page px-5 py-8 md:px-8 md:py-10", className)}>
      <div className="mx-auto max-w-7xl pt-14">{children}</div>
    </PageShell>
  );
}

export function AdminHeroCard({
  eyebrow,
  title,
  subtitle,
  actions,
}: AdminHeroCardProps) {
  return (
    <div className="admin-panel flex flex-col gap-5 rounded-2xl p-6 md:flex-row md:items-end md:justify-between md:p-7">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1 className="admin-heading mt-3 text-3xl font-semibold sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="admin-copy mt-3 max-w-3xl text-sm leading-6">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function AdminSection({
  children,
  eyebrow,
  title,
  actions,
  className,
}: AdminSectionProps) {
  return (
    <section className={adminCn("admin-card rounded-2xl p-4 md:p-5", className)}>
      {eyebrow || title || actions ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow ? <p className="admin-eyebrow">{eyebrow}</p> : null}
            {title ? (
              <h2 className="admin-heading mt-2 text-xl font-semibold">{title}</h2>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminStatCard({ label, value }: AdminStatCardProps) {
  return (
    <div className="admin-card rounded-2xl p-5">
      <p className="admin-eyebrow">{label}</p>
      <p className="admin-heading mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export function AdminToolbarButton({
  children,
  href,
  type = "button",
  variant = "secondary",
  disabled,
  onClick,
  className,
}: AdminToolbarButtonProps) {
  const buttonClassName = adminCn(
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-60",
    buttonVariants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={buttonClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
    >
      {children}
    </button>
  );
}

export function AdminFilterChip({ children, href, active }: AdminFilterChipProps) {
  return (
    <Link
      href={href}
      className={adminCn(
        "inline-flex rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
        active
          ? "border-[rgba(184,148,83,0.38)] bg-(--admin-gold-soft) text-(--admin-ink)"
          : "border-(--admin-border) bg-(--admin-surface) admin-copy hover:border-(--admin-gold) hover:text-(--admin-gold-strong)"
      )}
    >
      {children}
    </Link>
  );
}

export function AdminStatusBadge({
  children,
  tone = "neutral",
}: AdminStatusBadgeProps) {
  return (
    <span
      className={adminCn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        badgeTones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function AdminDataTable({
  headers,
  children,
  gridClassName,
  className,
}: AdminDataTableProps) {
  const autoGrid =
    "grid-cols-[repeat(var(--admin-table-cols),minmax(0,1fr))]";

  return (
    <div
      className={className}
      style={
        {
          "--admin-table-cols": headers.length,
        } as React.CSSProperties
      }
    >
      <div
        className={adminCn(
          "admin-table-head hidden gap-4 border-b px-4 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] lg:grid",
          gridClassName ?? autoGrid
        )}
      >
        {headers.map((header, index) => (
          <span className="justify-self-center" key={index}>{header}</span>
        ))}
      </div>

      <div className="divide-y divide-(--admin-border) ">{children}</div>
    </div>
  );
}

export function AdminDataRow({ children, gridClassName, href }: AdminDataRowProps) {
 const autoGrid = "grid-cols-[repeat(var(--admin-table-cols),minmax(0,1fr))]";

  const row = (
    <div
      className={adminCn(
        "grid gap-3 px-4 py-4 transition hover:bg-[rgba(184,148,83,0.08)] lg:items-center ",
        gridClassName ?? autoGrid
      )}
    >
      {children}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {row}
    </Link>
  ) : (
    row
  );
}

export function AdminEmptyState({ title, text }: AdminEmptyStateProps) {
  return (
    <div className="admin-detail-card rounded-2xl px-5 py-8 text-center">
      <p className="admin-heading text-base font-semibold">{title}</p>
      {text ? <p className="admin-muted mx-auto mt-2 max-w-xl text-sm">{text}</p> : null}
    </div>
  );
}

export function AdminDetailCard({ label, value }: AdminDetailCardProps) {
  return (
    <div className="admin-detail-card rounded-2xl p-4">
      <p className="admin-eyebrow">{label}</p>
      <p className="mt-3 text-sm leading-6 text-(--admin-ink)">{value}</p>
    </div>
  );
}
