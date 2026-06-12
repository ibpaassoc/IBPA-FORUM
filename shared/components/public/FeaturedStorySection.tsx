"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import PageSection from "./PageSection";
import FadeUp from "./FadeUp";
import SectionHeading from "./SectionHeading";

type FeaturedStorySectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  media: ReactNode;
  quote?: string;
  actions?: ReactNode;
  reverse?: boolean;
  className?: string;
};

export default function FeaturedStorySection({
  eyebrow,
  title,
  description,
  media,
  quote,
  actions,
  reverse,
  className,
}: FeaturedStorySectionProps) {
  return (
    <PageSection className={clsx("bg-[var(--color-off-white)]", className)}>
      <div
        className={clsx(
          "grid items-center gap-[var(--space-xl)] lg:grid-cols-2",
          reverse && "lg:grid-cols-[1fr_1fr]"
        )}
      >
        <FadeUp className={clsx(reverse && "lg:order-2")}>
          <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border-default)]">
            {media}
          </div>
        </FadeUp>

        <FadeUp className={clsx(reverse && "lg:order-1")}>
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          {quote ? (
            <blockquote className="mt-[var(--space-lg)] border-l-2 border-[var(--color-hover-accent)] pl-[var(--space-md)] font-[var(--font-accent-family)] text-[clamp(1.1rem,1.8vw,1.55rem)] italic leading-[1.45] text-[var(--color-ink-soft)]">
              {quote}
            </blockquote>
          ) : null}
          {actions ? <div className="mt-[var(--space-lg)]">{actions}</div> : null}
        </FadeUp>
      </div>
    </PageSection>
  );
}
