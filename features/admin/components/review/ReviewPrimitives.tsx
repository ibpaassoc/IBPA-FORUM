import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import clsx from "clsx";
import { DashboardKpiBar, GlassCard } from "@/shared/components/admin/DashboardUI";

export type ReviewIcon = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

/**
 * Top-of-workspace applicant summary: avatar, name, status badges, meta chips,
 * optional review-progress bar and a slot for back/edit actions.
 */
export function ReviewSummaryCard({
  name,
  subtitle,
  avatarSrc,
  badges,
  meta,
  progress,
  actions,
}: {
  name: string;
  subtitle?: ReactNode;
  avatarSrc?: string | null;
  badges?: ReactNode;
  meta?: Array<{ icon?: ReviewIcon; label: ReactNode }>;
  progress?: { value: number; label: string };
  actions?: ReactNode;
}) {
  const hasAvatar = avatarSrc !== undefined;

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {hasAvatar ? (
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={name}
                  width={160}
                  height={160}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <UserRound aria-hidden size={26} strokeWidth={1.6} />
              )}
            </div>
          ) : null}

          <div className="min-w-0">
            {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
            <h1 className="mt-2 font-[var(--font-title-family)] text-[clamp(1.55rem,4vw,2.35rem)] font-light leading-[1.05] tracking-[-0.025em] text-[var(--color-ink)]">
              {name}
            </h1>
            {subtitle ? (
              <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">{subtitle}</p>
            ) : null}
            {meta && meta.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {meta.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-[16px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-2.5 py-1 text-xs text-[var(--color-ink-soft)]"
                  >
                    {item.icon ? <item.icon aria-hidden size={13} className="shrink-0" /> : null}
                    <span className="truncate">{item.label}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {progress ? (
        <div className="mt-5 border-t border-[rgba(37,42,45,0.07)] pt-4">
          <DashboardKpiBar value={progress.value} label={progress.label} />
        </div>
      ) : null}
    </GlassCard>
  );
}

/** Section heading used for the stacked (mobile) review sections. */
export function ReviewSectionHeader({
  icon: Icon,
  children,
}: {
  icon?: ReviewIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {Icon ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          <Icon aria-hidden size={15} />
        </span>
      ) : null}
      <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">
        {children}
      </h2>
    </div>
  );
}

/** Glass wrapper for the sticky decision/action panel. */
export function ReviewActionPanel({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("p-4 sm:p-5", className)}>
      {title ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
          {title}
        </p>
      ) : null}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </GlassCard>
  );
}

/** Fixed bottom action bar for mobile review (sits where the global nav is hidden). */
export function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-2 rounded-[24px] border border-[rgba(114,160,193,0.22)] bg-white/85 p-2 shadow-[0_-14px_44px_rgba(37,42,45,0.14)] backdrop-blur-2xl lg:hidden">
      {children}
    </div>
  );
}
