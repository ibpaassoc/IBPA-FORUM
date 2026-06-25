"use client";

import { Mic } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PlaceholderSection } from "@/shared/components/public";

export default function HomeSpeakers() {
  const { t } = useLanguage();
  const c = t.home.speakers;

  return (
    <PlaceholderSection
      eyebrow={c.eyebrow}
      title={c.title}
      description={c.description}
      icon={Mic}
    />
  );
}
