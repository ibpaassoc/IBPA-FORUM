"use client";

import type { ReactNode, CSSProperties } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/shared/components/ui/Button";
import Reveal from "./Reveal";
import { PUBLIC_MOTION_EASE, PUBLIC_MOTION_DURATION } from "./motion-tokens";

// ─── SectionShell ────────────────────────────────────────────────────────────

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

// ─── PremiumSection ───────────────────────────────────────────────────────────

type PremiumSectionProps = {
  id?: string;
  children: ReactNode;
  surface?: "white" | "blue-tint" | "blue-wash" | "transparent";
  padded?: boolean;
  className?: string;
};

export function PremiumSection({
  id,
  children,
  surface = "white",
  padded = true,
  className,
}: PremiumSectionProps) {
  const style: CSSProperties =
    surface === "blue-tint" ? { background: "var(--surface-blue-tint)" } : {};

  const bgClass = {
    white: "bg-white",
    "blue-wash": "bg-[var(--color-blue-wash)]",
    transparent: "",
    "blue-tint": "",
  }[surface];

  return (
    <section id={id} style={style} className={clsx("relative overflow-hidden", bgClass, className)}>
      <div className={clsx("page-section", padded && "page-section-pad")}>
        {children}
      </div>
    </section>
  );
}

// ─── GlassCard ────────────────────────────────────────────────────────────────

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  accent?: "none" | "top" | "side";
  hoverLift?: boolean;
  tone?: "white" | "blue";
};

export function GlassCard({
  children,
  className,
  accent = "none",
  hoverLift = false,
  tone = "white",
}: GlassCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const baseClass = clsx(
    tone === "blue" ? "premium-glass-blue" : "premium-glass",
    accent === "top" &&
      "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[var(--color-blue-soft)] before:content-['']",
    accent === "side" &&
      "before:absolute before:inset-y-6 before:left-0 before:w-px before:bg-[var(--color-blue)] before:content-['']",
    className,
  );

  if (hoverLift && !shouldReduceMotion) {
    return (
      <motion.article
        className={baseClass}
        whileHover={{ y: -3, scale: 1.005 }}
        transition={{ duration: PUBLIC_MOTION_DURATION.fast, ease: PUBLIC_MOTION_EASE }}
      >
        {children}
      </motion.article>
    );
  }

  return <article className={baseClass}>{children}</article>;
}

// ─── InfoPanel ────────────────────────────────────────────────────────────────

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

// ─── PremiumSectionHeader ─────────────────────────────────────────────────────

type PremiumSectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function PremiumSectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: PremiumSectionHeaderProps) {
  const textAlign = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={clsx("flex flex-col gap-[var(--space-sm)]", textAlign, className)}>
      {eyebrow && (
        <Reveal>
          <p className="page-eyebrow">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={eyebrow ? 0.08 : 0}>
        <h2 className="font-[var(--font-title-family)] text-[clamp(1.9rem,3.5vw,3.2rem)] font-light leading-[1.06] tracking-[-0.02em] text-[var(--color-ink)]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={eyebrow ? 0.16 : 0.08}>
          <p className="page-copy max-w-2xl">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

// ─── OvalBlob ─────────────────────────────────────────────────────────────────

type OvalBlobProps = {
  color?: string;
  opacity?: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
};

const blobSizes = { sm: 320, md: 520, lg: 820 };

export function OvalBlob({
  color = "var(--color-blue-light)",
  opacity = 0.35,
  size = "md",
  animate = false,
  className,
}: OvalBlobProps) {
  const px = blobSizes[size];

  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("pointer-events-none absolute", className)}
      style={{
        width: px,
        height: px,
        opacity,
        animation: animate ? "blob-drift 18s ease-in-out infinite" : undefined,
        filter: "blur(40px)",
      }}
    >
      <path
        fill={color}
        d="M44.7,-62.3C56.3,-52.8,62.9,-37.3,66.8,-21.4C70.8,-5.5,72.1,10.8,67.2,25.5C62.4,40.2,51.3,53.3,37.7,61.4C24.1,69.5,8,72.5,-8.2,71.1C-24.4,69.8,-40.8,64.1,-52.8,53.4C-64.8,42.8,-72.4,27.1,-73.7,11C-74.9,-5.2,-69.8,-21.8,-60.6,-34.8C-51.4,-47.8,-38.1,-57.2,-24.4,-65.2C-10.6,-73.3,3.7,-80,18.2,-79.2C32.7,-78.3,33.1,-71.8,44.7,-62.3Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

export { Button as PremiumButton };
