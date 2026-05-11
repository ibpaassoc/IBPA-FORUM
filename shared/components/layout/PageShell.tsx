import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
  asideShellClassName?: string;
};

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

function joinClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PageShell({ children, className }: PageShellProps) {
  return <div className={joinClasses("page-shell", className)}>{children}</div>;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
  className,
  asideShellClassName,
}: PageHeroProps) {
  return (
    <section
      className={joinClasses(
        "relative overflow-hidden bg-[linear-gradient(160deg,var(--color-white)_0%,var(--color-blue-wash)_52%,var(--color-blue-soft)_100%)] pt-[clamp(60px,8vh,72px)] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_70%_60%_at_80%_40%,rgba(114,160,193,0.2)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(185,217,235,0.3)_0%,transparent_60%)]",
        className
      )}
    >
      <div className="page-section relative z-10 grid gap-(--space-xl) page-section-pad lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="page-eyebrow">{eyebrow}</p>
          <h1 className="mt-(--space-md) font-(--font-display) text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.1] text-(--color-ink)">
            {title}
          </h1>
          <p className="mt-(--space-md) max-w-2xl text-[clamp(0.875rem,1.5vw,1rem)] leading-[1.75] text-(--color-ink-soft)">
            {description}
          </p>
          {children ? <div className="mt-(--space-lg)">{children}</div> : null}
        </div>

        {aside ? (
          <div
            className={joinClasses(
              "rounded-(--radius) border border-(--border-default) bg-[rgba(255,255,255,0.72)] p-(--space-lg) text-(--color-ink) shadow-(--shadow-sm) backdrop-blur-md",
              asideShellClassName
            )}
          >
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PageSection({ children, className }: PageSectionProps) {
  return (
    <section className={joinClasses("page-section page-section-pad", className)}>
      {children}
    </section>
  );
}

export function PageCard({ children, className }: PageCardProps) {
  return (
    <div className={joinClasses("page-card p-(--space-lg)", className)}>
      {children}
    </div>
  );
}
