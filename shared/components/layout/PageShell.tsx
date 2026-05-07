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
}: PageHeroProps) {
  return (
    <section
      className={joinClasses(
        "relative overflow-hidden bg-[linear-gradient(160deg,var(--color-navy-deep)_0%,var(--color-navy)_50%,var(--color-navy-mid)_100%)] pt-[clamp(60px,8vh,72px)] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_70%_60%_at_80%_40%,rgba(124,168,200,0.15)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(201,169,110,0.08)_0%,transparent_60%)] after:absolute after:inset-0 after:bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] after:bg-size-[clamp(40px,5vw,60px)_clamp(40px,5vw,60px)] after:opacity-[0.04]",
        className
      )}
    >
      <div className="page-section relative z-10 grid gap-(--space-xl) page-section-pad lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="page-eyebrow">{eyebrow}</p>
          <h1 className="mt-(--space-md) font-(--font-display) text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.1] text-white">
            {title}
          </h1>
          <p className="mt-(--space-md) max-w-2xl text-[clamp(0.875rem,1.5vw,1rem)] leading-[1.75] text-[rgba(255,255,255,0.65)]">
            {description}
          </p>
          {children ? <div className="mt-(--space-lg)">{children}</div> : null}
        </div>

        {aside ? (
          <div className="rounded-(--radius) border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-(--space-lg) text-white backdrop-blur-md">{aside}</div>
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
