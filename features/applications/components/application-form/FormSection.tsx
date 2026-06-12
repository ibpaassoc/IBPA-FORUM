import type { ReactNode } from "react";

export default function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-(--radius) border border-(--border-default) bg-(--surface) p-(--space-lg) shadow-(--shadow-lg)">
      <div className="border-b border-(--border-default) pb-(--space-md)">
        <p className="text-[clamp(0.75rem,1.3vw,1.5rem)] font-medium uppercase tracking-[0.2em] text-(--color-hover-accent)">
          {eyebrow}
        </p>
        <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.1rem,2vw,1.6rem)] text-(--color-ink)">
          {title}
        </h2>
        <p className="mt-(--space-sm) max-w-3xl text-sm leading-[1.7] text-(--color-ink-soft)">
          {description}
        </p>
      </div>

      <div className="mt-(--space-md)">{children}</div>
    </section>
  );
}
