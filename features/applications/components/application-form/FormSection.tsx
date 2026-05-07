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
    <section className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-off-white)] p-[var(--space-lg)] shadow-[var(--shadow-lg)]">
      <div className="border-b border-[var(--border-default)] pb-[var(--space-md)]">
        <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-gold)]">
          {eyebrow}
        </p>
        <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-navy)]">
          {title}
        </h2>
        <p className="mt-[var(--space-sm)] max-w-3xl text-sm leading-[1.7] text-[var(--color-steel)]">
          {description}
        </p>
      </div>

      <div className="mt-[var(--space-md)]">{children}</div>
    </section>
  );
}
