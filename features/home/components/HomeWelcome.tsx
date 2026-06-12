"use client";

import { StaggerContainer } from "@/shared/components/public";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Trophy } from "lucide-react";

export default function HomeWelcome() {
  const { language, t } = useLanguage();
  const p = t.home.pricing;

  return (
    <section className="section-rhythm-tight">
      <div className="page-section">
        <div className="editorial-soft-divider rounded-[var(--radius)] px-[var(--space-md)] py-[var(--space-md)]">
          <StaggerContainer key={language} className="flex flex-col gap-[var(--space-lg)]" stagger={0.08}>

            {/* Award participation pricing */}
            <div>
              <p className="page-eyebrow mb-[var(--space-sm)]">{p.award.eyebrow}</p>
              <h3 className="mb-[var(--space-md)] font-[var(--font-title-family)] text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.1] text-[var(--color-ink)]">
                {p.award.title}
              </h3>
              <div className="grid gap-[var(--space-md)] md:grid-cols-2">
                {[p.award.ibpaMember, p.award.nonMember].map((card) => (
                  <article
                    key={card.label}
                    className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-md)]"
                  >
                    <p className="mb-[var(--space-sm)] text-[0.63rem] font-medium uppercase tracking-[0.18em] text-[var(--color-hover)]">
                      {card.label}
                    </p>
                    <div className="flex flex-col gap-[var(--space-xs)]">
                      {card.rows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between border-b border-[var(--border-default)] py-[var(--space-xs)]">
                          <span className="text-sm text-[var(--color-ink-soft)]">{row.label}</span>
                          <span className="font-[var(--font-title-family)] text-[1.05rem] text-[var(--color-ink)]">{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-[var(--space-sm)] flex items-center gap-2">
                      <Trophy size={13} className="text-[var(--color-hover)] shrink-0" />
                      <span className="text-[0.72rem] text-[var(--color-hover)] italic">{card.grandPrixLabel} &nbsp;{card.grandPrixNote}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Jury registration pricing */}
            <div>
              <p className="page-eyebrow mb-[var(--space-sm)]">{p.jury.eyebrow}</p>
              <h3 className="mb-[var(--space-md)] font-[var(--font-title-family)] text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.1] text-[var(--color-ink)]">
                {p.jury.title}
              </h3>
              <div className="grid gap-[var(--space-md)] md:grid-cols-2">
                <article className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-md)]">
                  <p className="mb-[var(--space-sm)] text-[0.63rem] font-medium uppercase tracking-[0.18em] text-[var(--color-hover)]">
                    {p.jury.standard.label}
                  </p>
                  <p className="mb-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(1.8rem,3vw,2.6rem)] leading-[1] text-[var(--color-ink)]">
                    {p.jury.standard.value}
                  </p>
                  <p className="text-sm leading-[1.7] text-[var(--color-ink-soft)]">{p.jury.standard.text}</p>
                </article>
                <article className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-md)]">
                  <p className="mb-[var(--space-sm)] text-[0.63rem] font-medium uppercase tracking-[0.18em] text-[var(--color-hover)]">
                    {p.jury.ibpaTrainer.label}
                  </p>
                  <p className="mb-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(1.8rem,3vw,2.6rem)] leading-[1] text-[var(--color-ink)]">
                    {p.jury.ibpaTrainer.value}
                  </p>
                  <p className="text-sm leading-[1.7] text-[var(--color-ink-soft)]">{p.jury.ibpaTrainer.text}</p>
                  <p className="mt-[var(--space-xs)] text-[0.8rem] italic text-[var(--color-hover)]">{p.jury.ibpaTrainer.note}</p>
                </article>
              </div>
            </div>

          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
