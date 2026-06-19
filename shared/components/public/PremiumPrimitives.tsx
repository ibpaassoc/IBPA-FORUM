import type { ReactNode } from "react";
import clsx from "clsx";
import Button from "@/shared/components/ui/Button";

type SectionShellProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  surface?: "default" | "white" | "tint" | "mist" | "blue";
  padded?: boolean;
};

const sectionSurfaces: Record<NonNullable<SectionShellProps["surface"]>, string> = {
  default: "bg-transparent",
  white: "bg-[var(--color-white)]",
  tint: "bg-[var(--surface-tint)]",
  mist: "bg-[var(--color-mist)]",
  blue: "bg-[linear-gradient(135deg,rgba(185,217,235,0.34),rgba(255,255,255,0.82))]",
};

export function SectionShell({
  id,
  children,
  className,
  innerClassName,
  surface = "default",
  padded = true,
}: SectionShellProps) {
  return (
    <section id={id} className={clsx("relative overflow-hidden", sectionSurfaces[surface], className)}>
      <div className={clsx("page-section", padded && "page-section-pad", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  accent?: "none" | "top" | "side";
};

export function GlassCard({ children, className, accent = "none" }: GlassCardProps) {
  return (
    <article
      className={clsx(
        "premium-glass",
        accent === "top" && "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[var(--color-blue-soft)] before:content-['']",
        accent === "side" && "before:absolute before:inset-y-6 before:left-0 before:w-px before:bg-[var(--color-blue)] before:content-['']",
        className,
      )}
    >
      {children}
    </article>
  );
}

type InfoPanelProps = {
  label?: string;
  value: ReactNode;
  detail?: ReactNode;
  className?: string;
};

export function InfoPanel({ label, value, detail, className }: InfoPanelProps) {
  return (
    <GlassCard className={clsx("p-[clamp(1rem,2vw,1.35rem)]", className)}>
      {label ? <p className="premium-label">{label}</p> : null}
      <div className="mt-2 font-[var(--font-title-family)] text-[clamp(1.15rem,2vw,1.65rem)] leading-[1.08] text-[var(--color-ink)]">
        {value}
      </div>
      {detail ? <div className="mt-3 page-copy text-[0.92rem]">{detail}</div> : null}
    </GlassCard>
  );
}

export { Button as PremiumButton };
