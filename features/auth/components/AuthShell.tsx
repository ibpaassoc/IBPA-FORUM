"use client";

import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <main className="page-shell px-[var(--page-gutter)] py-[var(--space-2xl)]">
      <div className="mx-auto max-w-[var(--content-width)] pt-[clamp(60px,8vh,72px)]">
        <div className="grid gap-[var(--space-lg)] lg:grid-cols-[1.08fr_0.92fr]">

          {/* Left — editorial panel (shown below form on mobile) */}
          <section className="order-2 flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.04)] bg-[var(--color-ink)] p-[var(--space-lg)] shadow-[var(--shadow-md)] lg:order-1">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue-soft)]">
              {eyebrow}
            </p>

            <h1 className="mt-[var(--space-md)] max-w-3xl font-[var(--font-display)] text-[clamp(2rem,4.5vw,3.8rem)] font-light leading-[1.08] text-white">
              {title}
            </h1>

            <p className="mt-[var(--space-md)] max-w-2xl text-sm leading-[1.75] text-[rgba(255,255,255,0.55)] sm:text-base">
              {description}
            </p>

            <div className="mt-[var(--space-xl)] h-px w-12 bg-[rgba(114,160,193,0.4)]" />

            <blockquote className="mt-[var(--space-lg)] max-w-xs font-[var(--font-accent-family)] text-[clamp(1rem,1.7vw,1.3rem)] italic leading-[1.65] text-[rgba(255,255,255,0.82)]">
              {t.auth.statement}
            </blockquote>

            <div className="mt-auto flex items-center gap-3 pt-[var(--space-xl)]">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)]">
                <Shield size={13} className="text-[var(--color-blue-soft)]" />
              </div>
              <p className="text-[clamp(0.6rem,0.85vw,0.68rem)] font-medium uppercase tracking-[0.22em] text-[rgba(255,255,255,0.35)]">
                {t.auth.trustBadge}
              </p>
            </div>
          </section>

          {/* Right — form card (shown first on mobile) */}
          <section className="page-card order-1 rounded-[var(--radius-lg)] p-[var(--space-lg)] lg:order-2">
            {children}
          </section>

        </div>
      </div>
    </main>
  );
}
