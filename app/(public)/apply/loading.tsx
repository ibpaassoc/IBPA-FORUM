"use client";

import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import ApplyHero from "@/features/applications/components/pages/ApplyHero";
import ApplyIntroCards from "@/features/applications/components/pages/ApplyIntroCards";
import { applicationTimeline } from "@/features/applications/config/application-timeline";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageSection, PageShell } from "@/shared/components/layout/PageShell";

export default function ApplyLoading() {
  const { language } = useLanguage();
  const labels = {
    en: ["Entry Fee", "Deadline", "Judging", "Ceremony"],
    ru: ["Взнос", "Дедлайн", "Оценивание", "Церемония"],
    ua: ["Внесок", "Дедлайн", "Оцінювання", "Церемонія"],
  }[language];

  const heroStats = [
    { label: labels[0], value: applicationTimeline.feeLabel },
    { label: labels[1], value: applicationTimeline.deadlineLabel },
    { label: labels[2], value: applicationTimeline.judgingLabel },
    { label: labels[3], value: applicationTimeline.ceremonyLabel },
  ];

  return (
    <PageShell>
      <ApplyHero heroStats={heroStats} />

      <PageSection className="space-y-8">
        <ApplyIntroCards />
        <ApplicationFormSkeleton />
      </PageSection>
    </PageShell>
  );
}
