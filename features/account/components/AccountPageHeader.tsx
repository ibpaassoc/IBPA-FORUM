import type { ReactNode } from "react";
import clsx from "clsx";

/**
 * Compact page header for the applicant account. The account pages keep the
 * eyebrow + serif title pairing of the admin dashboards, but at a restrained
 * size so the actual content (nominations, tickets, profile) stays the focus
 * on both phones and wide screens.
 */
export default function AccountPageHeader({
  eyebrow,
  title,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-wrap items-end justify-between gap-x-4 gap-y-3",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1.5 font-[var(--font-title-family)] text-[clamp(2.1rem,5vw,3rem)] font-light leading-[1.02] tracking-[-0.025em] text-[var(--color-ink)]">
          {title}
        </h1>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
