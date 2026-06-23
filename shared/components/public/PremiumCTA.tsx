"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import clsx from "clsx";
import FadeUp from "./FadeUp";
import { LandingPrimaryButton, LandingSecondaryButton } from "./LandingButtons";

type PremiumCTAProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  aside?: ReactNode;
  className?: string;
  dark?: boolean;
  /** When provided, renders as full-bleed photo CTA */
  backgroundImage?: string;
};

export default function PremiumCTA({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  aside,
  className,
  dark = false,
  backgroundImage,
}: PremiumCTAProps) {
  if (backgroundImage) {
    return (
      <section className={clsx("relative min-h-[580px] overflow-hidden md:min-h-[68vh]", className)}>
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-white/36" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.46)_100%)]" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <FadeUp className="relative z-10 max-w-3xl space-y-7 text-center">
            {eyebrow ? (
              <p className="font-[var(--font-ui-family)] text-[0.68rem] font-semibold uppercase tracking-[0.4em] text-[var(--color-blue)]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="font-[var(--font-title-family)] text-[clamp(2.2rem,4.5vw,3.8rem)] font-light uppercase leading-[0.94] tracking-[-0.03em] text-[var(--color-ink)] [text-shadow:0_2px_0_rgba(0,0,0,0.06),0_14px_28px_rgba(0,0,0,0.08)]">
              {title}
            </h2>
            {description ? (
              <p className="mx-auto max-w-xl font-[var(--font-body-family)] text-[1rem] leading-[1.75] text-[var(--color-ink-soft)]">
                {description}
              </p>
            ) : null}
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <LandingPrimaryButton href={primary.href}>
                {primary.label}
              </LandingPrimaryButton>
              {secondary ? (
                <LandingSecondaryButton href={secondary.href}>
                  {secondary.label}
                </LandingSecondaryButton>
              ) : null}
            </div>
          </FadeUp>
        </div>
      </section>
    );
  }

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
                <LandingPrimaryButton href={primary.href}>
                  {primary.label}
                </LandingPrimaryButton>
                {secondary ? (
                  <LandingSecondaryButton href={secondary.href}>
                    {secondary.label}
                  </LandingSecondaryButton>
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
