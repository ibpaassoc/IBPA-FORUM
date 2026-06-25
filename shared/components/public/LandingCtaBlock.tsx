"use client";

import type { ReactNode } from "react";
import { LandingPrimaryButton, LandingSecondaryButton } from "./LandingButtons";

// ─── LandingCtaBlock ──────────────────────────────────────────────────────────
// Two-column CTA + pricing panel shared between Grand Prix and Jury pages.
// Left: marketing copy + action buttons.
// Right: pricing cards grid.

type PricingItem = {
  label: string;
  price: string;
  detail?: string;
};

type LandingCtaBlockProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryButton: { href: string; label: string };
  secondaryButton?: { href: string; label: ReactNode };
  feesLabel: string;
  pricingItems: PricingItem[];
  pricingNote?: string;
};

export function LandingCtaBlock({
  eyebrow,
  title,
  description,
  primaryButton,
  secondaryButton,
  feesLabel,
  pricingItems,
  pricingNote,
}: LandingCtaBlockProps) {
  return (
    <section className="section-rhythm-loose px-[var(--page-gutter)]">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">

        {/* Left: copy + actions */}
        <article className="premium-glass flex flex-col rounded-[36px] p-8 md:p-10">
          <p className="page-eyebrow">{eyebrow}</p>
          <h3 className="mt-4 font-[var(--font-title-family)] text-[clamp(1.9rem,3.2vw,3rem)] font-light leading-[1.06] tracking-[-0.03em] text-[var(--color-ink)]">
            {title}
          </h3>
          <p className="mt-5 font-[var(--font-body-family)] text-[1rem] leading-[1.85] text-[var(--color-ink-soft)]">
            {description}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <LandingPrimaryButton href={primaryButton.href}>
              {primaryButton.label}
            </LandingPrimaryButton>

            {secondaryButton && (
              <LandingSecondaryButton href={secondaryButton.href}>
                {secondaryButton.label}
              </LandingSecondaryButton>
            )}
          </div>
        </article>

        {/* Right: pricing */}
        <article className="premium-glass rounded-[36px] bg-[linear-gradient(145deg,rgba(185,217,235,0.34),rgba(255,255,255,0.78))] p-8 shadow-[var(--shadow-md)] md:p-10">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-blue)]">
            {feesLabel}
          </p>

          <div className="mt-5 space-y-4">
            {pricingItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-[var(--color-blue-light)] bg-white/82 px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur-xl"
              >
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                  {item.label}
                </p>
                <p className="mt-2 font-[var(--font-title-family)] text-[2rem] font-light tracking-[-0.03em] text-[var(--color-ink)]">
                  {item.price}
                </p>
                {item.detail && (
                  <p className="mt-1 text-[0.78rem] leading-[1.6] text-[var(--color-ink-soft)]">
                    {item.detail}
                  </p>
                )}
                
              </div>
            ))}
            {pricingNote && (
              <div className="mt-5 flex gap-3 rounded-[22px] border border-[#b9d9eb]/45 bg-white/58 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]" />
                <p className="text-[0.72rem] leading-[1.65] text-[var(--color-ink-soft)]">
                  {pricingNote}
                </p>
              </div>
            )}
          </div>
        </article>

      </div>
    </section>
  );
}
