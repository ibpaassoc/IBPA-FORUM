"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import FadeUp from "./FadeUp";

type PremiumCTAProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  aside?: ReactNode;
  className?: string;
  dark?: boolean;
};

export default function PremiumCTA({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  aside,
  className,
  dark = true,
}: PremiumCTAProps) {
  return (
    <section
      className={clsx(
        "section-rhythm-loose",
        dark ? "bg-[var(--color-ink)]" : "bg-[var(--surface-tint)]",
        className
      )}
    >
      <div className="page-section">
        <FadeUp>
          <div className={clsx("grid gap-[var(--space-lg)]", aside && "xl:grid-cols-[1fr_auto] xl:items-end")}>
            <div>
              {eyebrow ? (
                <p className={clsx("page-eyebrow", dark && "text-[var(--color-blue-soft)] [&::before]:bg-[var(--color-blue-soft)]")}>
                  {eyebrow}
                </p>
              ) : null}
              <h2
                className={clsx(
                  "mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(2rem,4.5vw,4rem)] font-light leading-[1.08] text-pretty",
                  dark ? "text-white" : "text-[var(--color-ink)]"
                )}
              >
                {title}
              </h2>
              <p
                className={clsx(
                  "mt-[var(--space-sm)] max-w-2xl break-words text-[clamp(0.95rem,1.6vw,1.06rem)] leading-[1.8]",
                  dark ? "text-white/65" : "text-[var(--color-ink-soft)]"
                )}
              >
                {description}
              </p>
              <div className="mt-[var(--space-lg)] flex flex-wrap gap-3">
                <Link
                  href={primary.href}
                  className={clsx(
                    "ibpa-button",
                    dark ? "ibpa-button-white" : "ibpa-button-primary"
                  )}
                >
                  {primary.label}
                </Link>
                {secondary ? (
                  <Link
                    href={secondary.href}
                    className={clsx(
                      "ibpa-button",
                      dark
                        ? "border border-white/25 bg-transparent text-white hover:bg-white/10"
                        : "ibpa-button-ghost"
                    )}
                  >
                    {secondary.label}
                  </Link>
                ) : null}
              </div>
            </div>
            {aside ? (
              <div className={dark ? "text-white/60" : ""}>{aside}</div>
            ) : null}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
