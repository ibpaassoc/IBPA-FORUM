import type { ReactNode } from "react";
import clsx from "clsx";

type FeatureCardProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export default function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <article className={clsx("page-card rounded-(--radius) p-(--space-lg)", className)}>
      {icon ? <div className="mb-(--space-sm) text-(--color-hover)">{icon}</div> : null}
      <h3 className="text-[clamp(1.4rem,2.5vw,2rem)] leading-tight text-(--color-ink)">{title}</h3>
      <p className="mt-(--space-sm) page-copy">{description}</p>
    </article>
  );
}
