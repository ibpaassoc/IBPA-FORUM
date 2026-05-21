"use client";

import JuryApplicationForm from "@/features/jury/components/jury-application/JuryApplicationForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialPhotoCard,
  PageSection,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";

export default function JuryApplyPage() {
  const { language, t } = useLanguage();
  const copy = {
    en: {
      cardTitle: "Apply as an expert",
      cardText: "Structured, serious, and transparent from the first step.",
    },
    ru: {
      cardTitle: "Подача как эксперт",
      cardText: "Структурированно, серьезно и прозрачно с первого шага.",
    },
    ua: {
      cardTitle: "Подача як експерт",
      cardText: "Структуровано, серйозно й прозоро з першого кроку.",
    },
  }[language];

  return (
    <main className="page-shell">
      <PageSection className="pt-[clamp(76px,10vh,96px)]" surface="tint">
        <div className="grid gap-[var(--space-lg)] xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <SectionHeading
            eyebrow={t.juryPage.apply.eyebrow}
            title={t.juryPage.apply.title}
            description={t.juryPage.apply.text}
          />
        </div>
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <JuryApplicationForm />
      </PageSection>
    </main>
  );
}
