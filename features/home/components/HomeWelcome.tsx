"use client";

import { StaggerContainer } from "@/shared/components/public";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Trophy } from "lucide-react";

export default function HomeWelcome() {
  const { language, t } = useLanguage();
  const p = t.home.pricing;

  return (
    <section className="section-rhythm-tight bg-[var(--surface-tint)]">
      <div className="page-section">
        <StaggerContainer key={language} className="flex flex-col gap-[var(--space-xl)]" stagger={0.08}>

          {/* Award participation pricing */}
          <div>
            <p className="page-eyebrow mb-[var(--space-sm)]">{p.award.eyebrow}</p>
            <h2 className="mb-[var(--space-md)] font-[var(--font-title-family)] text-[clamp(1.6rem,3vw,2.6rem)] font-light leading-[1.1] text-[var(--color-ink)]">
              {p.award.title}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[p.award.ibpaMember, p.award.nonMember].map((card) => (
                <article
                  key={card.label}
                  className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-lg)]"
                >
                  <p className="mb-[var(--space-md)] text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">
                    {card.label}
                  </p>
                  <div className="flex flex-col gap-0">
                    {card.rows.map((row, i) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-between py-3 ${i < card.rows.length - 1 ? "border-b border-[var(--border-soft)]" : ""}`}
                      >
                        <span className="text-[0.9rem] text-[var(--color-ink-soft)]">{row.label}</span>
                        <span className="font-[var(--font-title-family)] text-[1.2rem] font-medium text-[var(--color-ink)]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-[var(--space-sm)] flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2">
                    <Trophy size={12} className="text-[var(--color-hover-accent)] shrink-0" />
                    <span className="text-[0.72rem] text-[var(--color-ink-soft)]">
                      <span className="font-semibold text-[var(--color-hover-accent)]">{card.grandPrixLabel}</span>
                      &nbsp;— {card.grandPrixNote}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Jury registration pricing */}
          <div>
            <p className="page-eyebrow mb-[var(--space-sm)]">{p.jury.eyebrow}</p>
            <h2 className="mb-[var(--space-md)] font-[var(--font-title-family)] text-[clamp(1.6rem,3vw,2.6rem)] font-light leading-[1.1] text-[var(--color-ink)]">
              {p.jury.title}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { ...p.jury.standard, note: undefined },
                { ...p.jury.ibpaTrainer },
              ].map((card) => (
                <article
                  key={card.label}
                  className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-lg)]"
                >
                  <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">
                    {card.label}
                  </p>
                  <p className="font-[var(--font-title-family)] text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1] text-[var(--color-ink)]">
                    {card.value}
                  </p>
                  <p className="mt-3 text-[0.9rem] leading-[1.7] text-[var(--color-ink-soft)]">{card.text}</p>
                  {card.note && (
                    <p className="mt-2 text-[0.8rem] italic text-[var(--color-hover-accent)]">{card.note}</p>
                  )}
                </article>
              ))}
            </div>
          </div>

        </StaggerContainer>
      </div>
    </section>
  );
}
