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
  id_section?: string;
  eyebrow: string;
  title: string;
  description?: string;
  steps: ProcessStep[];
  className?: string;
};

export default function ProcessTimeline({
  id_section,
  eyebrow,
  title,
  description,
  steps,
  className,
}: ProcessTimelineProps) {
  return (
    <PageSection id={id_section} className={className}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />

      <StaggerContainer className="mt-[var(--space-xl)]" stagger={0.09}>
        <div className="grid gap-px rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--border-default)] overflow-hidden md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.id}
              className="group relative bg-[var(--surface)] p-[var(--space-lg)] transition-colors duration-300 hover:bg-[var(--surface-muted)]"
            >
              <p className="mb-[var(--space-md)] font-[var(--font-title-family)] text-[3rem] font-light leading-[1] tracking-[-0.04em] text-[var(--color-ink)]/10 select-none italic">
                {String(index + 1).padStart(2, "0")}
              </p>
              {step.icon ? (
                <div className="mb-[var(--space-sm)] text-[var(--color-hover-accent)]">
                  {step.icon}
                </div>
              ) : null}
              <h3 className="font-[var(--font-title-family)] text-[clamp(1rem,1.4vw,1.2rem)] font-light leading-[1.15] text-[var(--color-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-[0.92rem] leading-[1.72] text-[var(--color-ink-soft)]">
                {step.text}
              </p>
            </article>
          ))}
          {/* Fill incomplete last row so no gray gap shows */}
          {steps.length % 3 !== 0
            ? Array.from({ length: 3 - (steps.length % 3) }).map((_, i) => (
                <div key={`filler-${i}`} className="bg-[var(--surface)]" aria-hidden />
              ))
            : null}
        </div>
      </StaggerContainer>
    </PageSection>
  );
}
