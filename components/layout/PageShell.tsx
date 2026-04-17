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
        "border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,194,122,0.16),transparent_35%),linear-gradient(135deg,#151515,#0f0f10_55%,#171718)] pt-10",
        className
      )}
    >
      <div className="page-section grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <p className="page-eyebrow">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="page-copy mt-5 max-w-2xl text-sm sm:text-base">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>

        {aside ? (
          <div className="page-card rounded-[1.75rem] p-6 lg:p-7">{aside}</div>
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
    <div className={joinClasses("page-card rounded-3xl p-6", className)}>
      {children}
    </div>
  );
}
