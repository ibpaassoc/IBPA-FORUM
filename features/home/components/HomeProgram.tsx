"use client";

import { CalendarClock } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PlaceholderSection } from "@/shared/components/public";

export default function HomeProgram() {
  const { t } = useLanguage();
  const c = t.home.program;

  return (
    <PlaceholderSection
      eyebrow={c.eyebrow}
      title={c.title}
      description={c.description}
      icon={CalendarClock}
      surface="blue-tint"
    />
  );
}
