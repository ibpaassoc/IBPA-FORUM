"use client";

import { ClipboardCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PremiumCTA } from "@/shared/components/public";

export default function JuryCta() {
  const { t } = useLanguage();

  return (
    <PremiumCTA
      eyebrow={t.juryPage.copy.ctaEyebrow}
      title={t.juryPage.copy.ctaTitle}
      description={t.juryPage.copy.ctaText}
      primary={{ href: "/apply/jury", label: t.common.applyAsJury }}
      secondary={{ href: "/jury/login", label: t.common.juryAccount }}
      aside={
        <div className="flex min-w-[220px] flex-col gap-3">
          <div className="flex items-center gap-3 rounded-[var(--radius)] border border-white/10 bg-white/6 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <ClipboardCheck
                size={16}
                className="text-[var(--color-hover-accent)]"
                strokeWidth={1.5}
              />
            </span>
            <span className="text-sm leading-[1.5] text-white/70">
              {t.juryPage.copy.ctaAside}
            </span>
          </div>
        </div>
      }
    />
  )
}
