"use client";

import {
  Calendar,
  Sparkles,
  Star,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  IconBadge,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";


export default function GrandPrixPagePremium() {
  const { t } = useLanguage();
  
  return (
    <section className="section-rhythm-tight">
      <div className="page-section">
        <SectionHeading
          eyebrow={t.grandPrixPage.copy.timelineEyebrow}
          title={t.grandPrixPage.copy.timelineTitle}
        />
        <StaggerContainer className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-3">
          {[
            {
              icon: Calendar,
              title: t.grandPrixPage.copy.appWindow,
              text: t.grandPrixPage.copy.appWindowText,
            },
            {
              icon: Star,
              title: t.grandPrixPage.copy.scorePeriod,
              text: t.grandPrixPage.copy.scorePeriodText,
            },
            {
              icon: Sparkles,
              title: t.grandPrixPage.copy.reveal,
              text: t.grandPrixPage.copy.revealText,
            },
          ].map((item) => (
            <article key={item.title} className="page-card rounded-[var(--radius)] p-[var(--space-lg)]">
              <IconBadge icon={item.icon} />
              <h3 className="mt-[var(--space-sm)] text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.2] text-[var(--color-ink)]">
                {item.title}
              </h3>
              <p className="mt-[var(--space-xs)] text-sm leading-[1.75] text-[var(--color-ink-soft)]">{item.text}</p>
            </article>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
