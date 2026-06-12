"use client";

import { StaggerContainer } from "@/shared/components/public";
import {
  Globe,
  Scale,
  Landmark,
  GraduationCap,
  Medal,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const featureIcons = [Globe, Scale, Landmark, GraduationCap, Medal, Trophy];

export default function HomeWhy() {
  const { t } = useLanguage();

  return (
    <section className="section-rhythm-loose bg-[var(--color-off-white)]">
      <div className="page-section">
        {/* Section header */}
        <div className="max-w-2xl">
          <p className="page-eyebrow">{t.home.copy.whyEyebrow}</p>
          <h2 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(2rem,4vw,3.6rem)] font-light leading-[1.12] text-[var(--color-ink)]">
            {t.home.copy.whyTitle}
          </h2>
          <p className="mt-[var(--space-sm)] max-w-xl text-[clamp(0.95rem,1.6vw,1.06rem)] leading-[1.8] text-[var(--color-ink-soft)]">
            {t.home.copy.whyText}
          </p>
        </div>

        {/* Feature grid */}
        <StaggerContainer
          className="mt-[var(--space-xl)] grid gap-px rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--border-default)] overflow-hidden md:grid-cols-2 lg:grid-cols-3"
          stagger={0.07}
        >
          {t.home.copy.whyFeatures.map((item, index) => {
            const Icon = featureIcons[index % featureIcons.length];
            return (
              <article
                key={item.title}
                className="group bg-[var(--surface)] p-[var(--space-lg)] transition-colors duration-300 hover:bg-[var(--surface-muted)]"
              >
                <div className="mb-[var(--space-sm)] inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-muted)]">
                  <Icon size={18} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 font-[var(--font-ui-family)] text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="text-[0.93rem] leading-[1.72] text-[var(--color-ink-soft)]">
                  {item.text}
                </p>
              </article>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
