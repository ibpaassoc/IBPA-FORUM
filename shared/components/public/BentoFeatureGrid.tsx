"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import PageSection from "./PageSection";
import SectionHeading from "./SectionHeading";
import HoverCard from "./HoverCard";
import StaggerContainer from "./StaggerContainer";

type BentoFeatureItem = {
  id: string;
  icon?: ReactNode;
  title: string;
  text: string;
  tone?: "default" | "tint" | "mist";
  span?: "normal" | "wide" | "tall";
};

type BentoFeatureGridProps = {
  eyebrow: string;
  title: string;
  description?: string;
  items: BentoFeatureItem[];
  className?: string;
};

function getSpanClass(span: BentoFeatureItem["span"]) {
  if (span === "wide") return "md:col-span-2";
  if (span === "tall") return "md:row-span-2";
  return "";
}

function getToneClass(tone: BentoFeatureItem["tone"]) {
  if (tone === "tint") return "bg-[var(--surface-tint)]";
  if (tone === "mist") return "bg-[var(--color-mist)]";
  return "bg-[var(--surface)]";
}

export default function BentoFeatureGrid({
  eyebrow,
  title,
  description,
  items,
  className,
}: BentoFeatureGridProps) {
  return (
    <PageSection className={className}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <StaggerContainer className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:auto-rows-[1fr] md:grid-cols-3">
        {items.map((item) => (
          <HoverCard
            key={item.id}
            className={clsx(
              "page-card flex h-full flex-col rounded-[var(--radius)] p-[var(--space-lg)]",
              getSpanClass(item.span),
              getToneClass(item.tone)
            )}
          >
            {item.icon ? <div className="mb-[var(--space-sm)]">{item.icon}</div> : null}
            <h3 className="text-[clamp(1.15rem,1.8vw,1.6rem)] leading-[1.2] text-[var(--color-ink)] text-pretty">
              {item.title}
            </h3>
            <p className="mt-[var(--space-sm)] break-words text-sm leading-[1.8] text-[var(--color-ink-soft)]">
              {item.text}
            </p>
          </HoverCard>
        ))}
      </StaggerContainer>
    </PageSection>
  );
}
