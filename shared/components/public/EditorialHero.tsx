"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import PageSection from "./PageSection";
import FadeUp from "./FadeUp";
import StaggerContainer from "./StaggerContainer";
import FloatingElement from "./FloatingElement";

type EditorialHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  media: ReactNode;
  floatingCard?: ReactNode;
  className?: string;
};

export default function EditorialHero({
  eyebrow,
  title,
  description,
  actions,
  media,
  floatingCard,
  className,
}: EditorialHeroProps) {
  return (
    <PageSection className={clsx("pt-[clamp(76px,10vh,96px)]", className)} surface="tint">
      <div className="grid items-center gap-[var(--space-xl)] xl:grid-cols-[1fr_1.06fr]">
        <StaggerContainer className="max-w-2xl" stagger={0.1}>
          {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-[var(--space-sm)] text-[clamp(2.2rem,5vw,5rem)] leading-[1.02] text-[var(--color-ink)] text-pretty">
            {title}
          </h1>
          <p className="mt-[var(--space-md)] script-accent max-w-xl break-words text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.8] text-[var(--color-ink-soft)]">
            {description}
          </p>
          {actions ? <div className="mt-[var(--space-lg)] flex flex-wrap gap-3">{actions}</div> : null}
        </StaggerContainer>

        <FadeUp className="relative">
          {media}
          {floatingCard ? <div className="mt-[var(--space-md)] md:hidden">{floatingCard}</div> : null}
          {floatingCard ? (
            <FloatingElement className="absolute -right-6 -bottom-6 z-10 hidden w-[min(320px,58%)] md:block">
              {floatingCard}
            </FloatingElement>
          ) : null}
        </FadeUp>
      </div>
    </PageSection>
  );
}
