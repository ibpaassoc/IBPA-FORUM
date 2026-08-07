import type { ReactNode } from "react";
import clsx from "clsx";
import { GlassCard } from "./PremiumPrimitives";

type FeatureCardProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export default function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <GlassCard className={clsx("p-[var(--space-lg)]", className)} accent="top">
      {icon ? <div className="mb-[var(--space-sm)] text-[var(--color-hover-accent)]">{icon}</div> : null}
      <h3 className="text-[clamp(1.4rem,2.5vw,2rem)] leading-tight text-[var(--color-ink)]">{title}</h3>
      <p className="mt-[var(--space-sm)] page-copy">{description}</p>
    </GlassCard>
  );
}
