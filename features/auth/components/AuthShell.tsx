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
          <section className="order-2 flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-blue-light)] bg-[var(--color-blue-wash)] p-[var(--space-lg)] shadow-[var(--shadow-md)] lg:order-1">
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
              {eyebrow}
            </p>

            <h1 className="mt-[var(--space-md)] max-w-3xl font-[var(--font-display)] text-[clamp(2rem,4.5vw,3.8rem)] font-light leading-[1.08] text-[var(--color-ink)]">
              {title}
            </h1>

            <p className="mt-[var(--space-md)] max-w-2xl text-sm leading-[1.75] text-[var(--color-ink-soft)] sm:text-base">
              {description}
            </p>

            <div className="mt-[var(--space-xl)] h-px w-12 bg-[var(--color-blue)]/40" />

            <blockquote className="mt-[var(--space-lg)] max-w-xs font-[var(--font-accent-family)] text-[clamp(1rem,1.7vw,1.3rem)] italic leading-[1.65] text-[var(--color-ink-soft)]">
              {t.auth.statement}
            </blockquote>

            <div className="mt-auto flex items-center gap-3 pt-[var(--space-xl)]">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-blue)]/20 bg-white/60">
                <Shield size={13} className="text-[var(--color-blue)]" />
              </div>
              <p className="text-[clamp(0.6rem,0.85vw,0.68rem)] font-medium uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
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
