"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryBenefits() {
  const { t } = useLanguage();
  const b = t.juryPage.benefits;

  return (
    <section className="bg-white py-[var(--space-2xl)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)]">
        <div className="grid gap-[var(--space-xl)] lg:grid-cols-[1fr_1.2fr] lg:items-start">

          <div>
            <p className="page-eyebrow">{b.eyebrow}</p>
            <h2 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(1.8rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[var(--color-ink)]">
              {b.title}
            </h2>
            <p className="mt-[var(--space-sm)] text-[0.95rem] leading-[1.78] text-[var(--color-ink-soft)]">
              {b.description}
            </p>
          </div>

          <div className="premium-glass overflow-hidden rounded-[var(--radius)]">
            {b.items.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 px-[var(--space-lg)] py-[var(--space-md)] ${
                  i < b.items.length - 1 ? "border-b border-[var(--border-soft)]" : ""
                } transition-colors hover:bg-[var(--color-blue-wash)]/55`}
              >
                <span className="mt-0.5 shrink-0 font-[var(--font-ui-family)] text-[0.68rem] font-black tracking-[0.08em] text-[var(--color-hover-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[0.93rem] leading-[1.7] text-[var(--color-ink)]">{item}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
