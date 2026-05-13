"use client";

import { StaggerContainer } from "@/shared/components/public";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeWelcome() {
  const { language, t } = useLanguage();

  return (
    <section className="section-rhythm-tight">
      <div className="page-section">
        <div className="editorial-soft-divider rounded-[var(--radius)] px-[var(--space-md)] py-[var(--space-md)]">
          <StaggerContainer
            key={language}
            className="grid gap-[var(--space-md)] md:grid-cols-2 xl:grid-cols-4"
            stagger={0.1}
          >
            {t.home.stats.map((item) => (
              <article key={`${language}-${item.title}`} className="px-[var(--space-sm)]">
                <p className="mb-[var(--space-xs)] text-[0.66rem] uppercase tracking-[0.17em] text-[var(--color-hover)]">
                  {item.title}
                </p>

                <p className="mb-[var(--space-xs)] font-[var(--font-title-family)] text-[clamp(1.55rem,2.8vw,2.3rem)] leading-[1.1] text-[var(--color-ink)]">
                  {item.value}
                </p>

                <p className="text-sm leading-[1.7] text-[var(--color-ink-soft)]">
                  {item.text}
                </p>
              </article>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
