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
    <PageSection className={className} surface="mist">
      <div
        className={clsx(
          "grid items-center gap-[var(--space-lg)] lg:grid-cols-[0.95fr_1.05fr]",
          reverse && "lg:grid-cols-[1.05fr_0.95fr]"
        )}
      >
        <FadeUp className={clsx(reverse && "lg:order-2")}>{media}</FadeUp>

        <FadeUp className={clsx("max-w-xl", reverse && "lg:order-1 lg:justify-self-start")}>
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          {quote ? (
            <blockquote className="mt-[var(--space-md)] border-l border-[var(--border-strong)] pl-[var(--space-md)] font-[var(--font-title-family)] text-[clamp(1.2rem,2vw,1.8rem)] leading-[1.35] text-[var(--color-ink-soft)]">
              {quote}
            </blockquote>
          ) : null}
          {actions ? <div className="mt-[var(--space-lg)]">{actions}</div> : null}
        </FadeUp>
      </div>
    </PageSection>
  );
}
