"use client";

import type { ReactNode } from "react";
import PageSection from "./PageSection";
import SectionHeading from "./SectionHeading";
import StaggerContainer from "./StaggerContainer";

type ProcessStep = {
  id: string;
  title: string;
  text: string;
  icon?: ReactNode;
};

type ProcessTimelineProps = {
  eyebrow: string;
  title: string;
  description?: string;
  steps: ProcessStep[];
  className?: string;
};

export default function ProcessTimeline({
  eyebrow,
  title,
  description,
  steps,
  className,
}: ProcessTimelineProps) {
  return (
    <PageSection className={className}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <StaggerContainer className="relative mt-[var(--space-lg)]">
        <ol className="relative space-y-[var(--space-md)] before:absolute before:top-4 before:bottom-4 before:left-[15px] before:w-px before:bg-[var(--border-strong)] md:before:left-1/2">
          {steps.map((step, index) => (
            <li key={step.id} className="relative">
              <div className="absolute top-3 left-[9px] z-10 h-3.5 w-3.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] md:left-[calc(50%-7px)]" />
              <article
                className={`page-card rounded-[var(--radius)] p-[var(--space-md)] md:max-w-[48%] ${
                  index % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                }`}
              >
                {step.icon ? <div className="mb-[var(--space-xs)]">{step.icon}</div> : null}
                <h3 className="text-[clamp(1.1rem,1.8vw,1.4rem)] leading-[1.2] text-[var(--color-ink)]">{step.title}</h3>
                <p className="mt-[var(--space-xs)] text-sm leading-[1.75] text-[var(--color-ink-soft)]">{step.text}</p>
              </article>
            </li>
          ))}
        </ol>
      </StaggerContainer>
    </PageSection>
  );
}
