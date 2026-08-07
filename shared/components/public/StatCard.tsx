import clsx from "clsx";

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
  className?: string;
};

export default function StatCard({ label, value, description, className }: StatCardProps) {
  return (
    <article className={clsx("page-card rounded-[var(--radius)] p-[var(--space-lg)]", className)}>
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-hover-accent)]">{label}</p>
      <p className="mt-[var(--space-xs)] font-[var(--font-title-family)] text-[clamp(1.6rem,3vw,2.7rem)] leading-[1.05] text-[var(--color-ink)]">
        {value}
      </p>
      {description ? <p className="mt-[var(--space-sm)] page-copy">{description}</p> : null}
    </article>
  );
}
