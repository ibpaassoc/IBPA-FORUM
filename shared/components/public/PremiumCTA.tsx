"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import PageSection from "./PageSection";
import FadeUp from "./FadeUp";

type PremiumCTAProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  aside?: ReactNode;
  className?: string;
};

export default function PremiumCTA({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  aside,
  className,
}: PremiumCTAProps) {
  return (
    <PageSection className={className} surface="tint">
      <FadeUp className="page-card rounded-[var(--radius-lg)] bg-[var(--surface)] px-[var(--space-xl)] py-[var(--space-xl)]">
        <div className={clsx("grid gap-[var(--space-lg)]", aside && "xl:grid-cols-[1fr_auto] xl:items-end")}>
          <div>
            {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
            <h2 className="mt-[var(--space-sm)] text-[clamp(2rem,3.8vw,3.6rem)] leading-[1.06] text-[var(--color-ink)] text-pretty">
              {title}
            </h2>
            <p className="mt-[var(--space-sm)] max-w-2xl break-words text-[clamp(0.95rem,1.6vw,1.06rem)] leading-[1.8] text-[var(--color-ink-soft)]">
              {description}
            </p>
            <div className="mt-[var(--space-lg)] flex flex-wrap gap-3">
              <Link href={primary.href} className="ibpa-button ibpa-button-primary">
                {primary.label}
              </Link>
              {secondary ? (
                <Link href={secondary.href} className="ibpa-button ibpa-button-ghost">
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
          {aside ? <div>{aside}</div> : null}
        </div>
      </FadeUp>
    </PageSection>
  );
}
