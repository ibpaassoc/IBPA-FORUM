"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageShell } from "@/shared/components/layout/PageShell";

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <PageShell className="px-[var(--page-gutter)] py-[var(--space-2xl)]">
      <div className="mx-auto max-w-[var(--content-width)] pt-[clamp(60px,8vh,72px)]">
        <div className="grid gap-[var(--space-lg)] lg:grid-cols-[1.08fr_0.92fr]">
          <section className="page-card p-[var(--space-lg)]">
            <p className="page-eyebrow">
              {eyebrow}
            </p>
            <h1 className="mt-[var(--space-md)] max-w-3xl font-[var(--font-display)] text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-[1.1] text-[var(--color-navy)]">
              {title}
            </h1>
            <p className="mt-[var(--space-md)] max-w-2xl text-sm leading-[1.7] text-[var(--color-steel)] sm:text-base">
              {description}
            </p>

            <div className="mt-[var(--space-lg)] grid gap-[var(--space-sm)] sm:grid-cols-3">
              {t.auth.shellCards.map((item) => (
                <div key={item} className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-off-white)] p-[var(--space-sm)]">
                  <p className="text-sm font-medium text-[var(--color-navy)]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-[var(--space-lg)] rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-mist)] p-[var(--space-md)]">
              <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-hover)]">
                {t.auth.access}
              </p>
              <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)]">
                {t.auth.accessText}
              </p>
              <div className="mt-[var(--space-md)] flex flex-wrap gap-[var(--space-sm)]">
                <Link
                  href="/jury/login"
                  className="ibpa-button ibpa-button-ghost"
                >
                  {t.auth.loginLink}
                </Link>
                <Link
                  href="/jury/register"
                  className="ibpa-button ibpa-button-gold"
                >
                  {t.auth.registerLink}
                </Link>
              </div>
            </div>
          </section>

          <section className="page-card p-[var(--space-lg)]">
            {children}
            {footer ? <div className="mt-[var(--space-md)]">{footer}</div> : null}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
