"use client";

import { ClipboardCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { IconBadge, PremiumCTA } from "@/shared/components/public";

export default function JuryCta() {
  const { t } = useLanguage();

  return (
    <PremiumCTA
      eyebrow={t.juryPage.copy.ctaEyebrow}
      title={t.juryPage.copy.ctaTitle}
      description={t.juryPage.copy.ctaText}
      primary={{ href: "/apply/jury", label: t.common.applyNow }}
      secondary={{ href: "/jury/login", label: t.common.juryAccount }}
      aside={
        <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <IconBadge icon={ClipboardCheck} size={20} />
          {t.juryPage.copy.ctaAside}
        </div>
      }
    />
  )
}
