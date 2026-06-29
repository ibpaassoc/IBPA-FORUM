"use client";

import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
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
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-[var(--page-gutter)] py-[var(--space-2xl)]">
      {/* ambient soft-blue backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-[-6rem] size-[28rem] rounded-full bg-[rgba(185,217,235,0.4)] blur-[120px]" />
        <div className="absolute -right-24 bottom-[-8rem] size-[26rem] rounded-full bg-[rgba(114,160,193,0.2)] blur-[130px]" />
      </div>

      <div className="w-full max-w-[440px]">
        <header className="mb-[var(--space-lg)] text-center">
          <p className="text-[clamp(0.62rem,1vw,0.72rem)] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
            {eyebrow}
          </p>
          <h1 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.7rem,4vw,2.6rem)] font-light leading-[1.1] text-[var(--color-ink)]">
            {title}
          </h1>
          <p className="mx-auto mt-[var(--space-sm)] max-w-sm text-sm leading-[1.65] text-[var(--color-ink-soft)]">
            {description}
          </p>
        </header>

        <section className="rounded-[var(--radius-lg)] border border-[rgba(114,160,193,0.2)] bg-white/80 p-[clamp(1.25rem,4vw,2rem)] shadow-[0_28px_80px_rgba(37,42,45,0.1)] backdrop-blur-2xl">
          {children}
        </section>

        <p className="mt-[var(--space-md)] flex items-center justify-center gap-2 text-center text-[clamp(0.58rem,0.85vw,0.66rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
          <ShieldCheck size={13} className="shrink-0 text-[var(--color-blue)]" />
          {t.auth.trustBadge}
        </p>
      </div>
    </main>
  );
}
