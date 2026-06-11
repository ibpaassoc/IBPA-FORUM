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
    <section key="gallery" className="section-rhythm-tight">
      <div className="page-section">
        <div className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[linear-gradient(180deg,var(--surface-tint)_0%,var(--surface)_100%)] p-[clamp(1.1rem,2.8vw,2rem)]">
          <div className="max-w-3xl">
            <p className="page-eyebrow">{t.home.copy.whyEyebrow}</p>
            <h2 className="mt-[var(--space-sm)] text-[clamp(2rem,4.6vw,4.3rem)] leading-[1.05] text-[var(--color-ink)]">
              {t.home.copy.whyTitle}
            </h2>
            <p className="mt-[var(--space-sm)] text-[clamp(0.95rem,1.7vw,1.12rem)] leading-[1.75] text-[var(--color-ink-soft)]">
              {t.home.copy.whyText}
            </p>
          </div>

          <StaggerContainer
            className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-2"
            stagger={0.09}
          >
            {t.home.copy.whyFeatures.map((item, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
                <article
                  key={item.title}
                  className="group relative overflow-hidden rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] p-[var(--space-lg)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--color-hover)]/70 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mb-[var(--space-sm)] flex items-center gap-3">
                    <Icon size={18} className="text-[var(--color-hover)] shrink-0" />
                    <h3 className="text-[clamp(0.95rem,1.5vw,1.1rem)] font-medium leading-[1.3] text-[var(--color-ink)]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-[1.7] text-[var(--color-ink-soft)]">{item.text}</p>
                </article>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
