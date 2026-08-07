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
        "relative overflow-hidden bg-[var(--surface-tint)] pt-[clamp(60px,8vh,72px)]",
        className
      )}
    >
      <div className="page-section relative z-10 grid gap-[var(--space-xl)] page-section-pad lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="page-eyebrow">{eyebrow}</p>
          <h1 className="mt-[var(--space-md)] font-[var(--font-display)] text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.1] text-[var(--color-ink)]">
            {title}
          </h1>
          <p className="mt-[var(--space-md)] max-w-2xl text-[clamp(0.875rem,1.5vw,1rem)] leading-[1.75] text-[var(--color-ink-soft)]">
            {description}
          </p>
          {children ? <div className="mt-[var(--space-lg)]">{children}</div> : null}
        </div>

        {aside ? (
          <div
            className={joinClasses(
              "rounded-[var(--radius)] border border-[var(--border-default)] bg-[rgba(255,255,255,0.72)] p-[var(--space-lg)] text-[var(--color-ink)] shadow-[var(--shadow-sm)] backdrop-blur-md",
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
    <div className={joinClasses("page-card p-[var(--space-lg)]", className)}>
      {children}
    </div>
  );
}
