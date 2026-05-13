"use client";

import {
  Award,
  Medal,
  Trophy,
  Users,
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
      title={t.grandPrixPage.copy.selectionTitle}
      steps={t.grandPrixPage.flow.steps.map((step, index) => ({
        id: step.number,
        title: step.title,
        text: step.text,
        icon: <IconBadge icon={[Medal, Users, Trophy, Award][index % 4]} />,
      }))}
    />
  );
}
