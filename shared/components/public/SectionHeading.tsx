import type { ReactNode } from "react";
import clsx from "clsx";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  actions?: ReactNode;
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  actions,
  className,
}: SectionHeadingProps) {
  const center = align === "center";
  return (
    <div className={clsx(center && "mx-auto text-center", className)}>
      {eyebrow ? <p className={clsx("page-eyebrow", center && "justify-center")}>{eyebrow}</p> : null}
      <h2 className="mt-(--space-sm) font-[var(--font-title-family)] text-[clamp(1.8rem,4vw,3.2rem)] font-light leading-[1.08] text-[var(--color-ink)] text-pretty">
        {title}
      </h2>
      {description ? (
        <p className={clsx(" mt-(--space-sm) page-copy max-w-2xl break-words", center && "mx-auto")}>
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-(--space-md)">{actions}</div> : null}
    </div>
  );
}
