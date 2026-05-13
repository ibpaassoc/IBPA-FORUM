"use client";

import {
  Award,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  IconBadge,
  PremiumCTA,
} from "@/shared/components/public";


export default function GrandPrixPagePremium() {
  const { t } = useLanguage();
  

  return (
    <PremiumCTA
      eyebrow={t.grandPrixPage.copy.ctaEyebrow}
      title={t.grandPrixPage.copy.ctaTitle}
      description={t.grandPrixPage.copy.ctaText}
      primary={{ href: "/apply", label: t.grandPrixPage.copy.startEntry }}
      secondary={{ href: "/directions", label: t.grandPrixPage.copy.viewDirections }}
      aside={
        <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <IconBadge icon={Award} size={20} />
          {t.grandPrixPage.copy.strategy}
        </div>
      }
    />
  );
}
