"use client";

import { ProcessTimeline, IconBadge } from "@/shared/components/public";
import {
  Award,
  ClipboardCheck,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeTimeline() {
    const { t } = useLanguage();

    return (
        <ProcessTimeline
        id_section="timeline"
        eyebrow={t.home.process.label}
        title={t.home.process.title}
        steps={t.home.process.steps.map((step, index) => ({
          id: step.number,
          title: step.title,
          text: step.text,
          icon: <IconBadge icon={[Search, ClipboardCheck, Award, Trophy, Users][index % 5]} />,
        }))}
      />
    );
}
