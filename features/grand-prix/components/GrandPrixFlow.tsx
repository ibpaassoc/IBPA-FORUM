"use client";

import {
  Award,
  Medal,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  IconBadge,
  ProcessTimeline,
} from "@/shared/components/public";

export default function GrandPrixFlow() {
  const { t } = useLanguage();
  
  return (
    <ProcessTimeline
      eyebrow={t.grandPrixPage.flow.label}
      title={t.grandPrixPage.flow.title}
      steps={t.grandPrixPage.flow.steps.map((step, index) => ({
        id: step.number,
        title: step.title,
        text: step.text,
        icon: <IconBadge icon={[Medal, Trophy, Award][index % 3]} />,
      }))}
    />
  );
}
