"use client";

import {
  Award,
  BadgeCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  IconBadge,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";


export default function JuryBenefits() {
  const { t } = useLanguage();

  return (
    <section className="section-rhythm-tight">
      <div className="page-section">
        <SectionHeading
          eyebrow={t.juryPage.copy.benefitsEyebrow}
          title={t.juryPage.copy.benefitsTitle}
        />
        <StaggerContainer className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-2">
          {[
            {
              title: t.juryPage.copy.b1Title,
              text: t.juryPage.copy.b1Text,
              icon: Award,
            },
            {
              title: t.juryPage.copy.b2Title,
              text: t.juryPage.copy.b2Text,
              icon: ShieldCheck,
            },
            {
              title: t.juryPage.copy.b3Title,
              text: t.juryPage.copy.b3Text,
              icon: Users,
            },
            {
              title: t.juryPage.copy.b4Title,
              text: t.juryPage.copy.b4Text,
              icon: BadgeCheck,
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
