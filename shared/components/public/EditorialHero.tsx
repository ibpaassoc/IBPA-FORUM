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
  variant?: "default" | "home";
};

export default function EditorialHero({
  eyebrow,
  title,
  description,
  actions,
  media,
  floatingCard,
  className,
  variant = "default",
}: EditorialHeroProps) {
  const isHome = variant === "home";

  return (
    <PageSection
      className={clsx(
        isHome
          ? "pt-[clamp(72px,9vh,104px)]"
          : "pt-[clamp(76px,10vh,96px)]",
        className
      )}
      surface="tint"
    >
      <div
        className={clsx(
          "grid items-center",
          isHome
            ? "gap-[clamp(2rem,6vw,5rem)] xl:grid-cols-[0.62fr_1.38fr]"
            : "gap-[var(--space-xl)] xl:grid-cols-[1fr_1.06fr]"
        )}
      >
        <StaggerContainer
          className={clsx(
            isHome
              ? "mx-auto max-w-[620px] text-center xl:mx-0 xl:max-w-[520px] xl:text-left"
              : "max-w-2xl"
          )}
          stagger={0.1}
        >
          {eyebrow ? (
            <p className={clsx("page-eyebrow", isHome && "justify-center xl:justify-start")}>
              {eyebrow}
            </p>
          ) : null}

          <h1
            className={clsx(
              "mt-[var(--space-sm)] text-[var(--color-ink)] text-balance",
              isHome
                ? "mx-auto max-w-[10ch] text-[clamp(3.5rem,16vw,5.6rem)] leading-[0.9] tracking-[-0.04em] xl:mx-0 xl:text-[clamp(4.4rem,6.6vw,7rem)]"
                : "text-[clamp(2.2rem,5vw,5rem)] leading-[1.02] text-pretty"
            )}
          >
            {title}
          </h1>

          <p
            className={clsx(
              "script-accent mt-[var(--space-md)] break-words text-[var(--color-ink-soft)]",
              isHome
                ? "mx-auto max-w-[38rem] text-[clamp(1.05rem,4vw,1.35rem)] leading-[1.65] xl:mx-0 xl:max-w-[34rem] xl:text-[clamp(1.05rem,1.45vw,1.35rem)]"
                : "max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.8]"
            )}
          >
            {description}
          </p>

          {actions ? (
            <div
              className={clsx(
                "mt-[var(--space-lg)] flex flex-wrap gap-3",
                isHome && "justify-center xl:justify-start"
              )}
            >
              {actions}
            </div>
          ) : null}
        </StaggerContainer>

        <FadeUp className="relative">
          {media}

          {floatingCard ? (
            <div className="mt-[var(--space-md)] md:hidden">{floatingCard}</div>
          ) : null}

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
