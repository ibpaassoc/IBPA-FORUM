"use client";

import {
  IconBadge,
  PremiumCTA,
} from "@/shared/components/public";

import {
  BadgeCheck,
  Trophy,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeWhy() {
    const { t } = useLanguage();

    return (
        <PremiumCTA
                eyebrow={t.home.cta.label}
                title={t.home.cta.title}
                description={t.home.cta.text}
                primary={{ href: "/apply", label: t.common.applyNow }}
                secondary={{ href: "/jury", label: t.home.cta.judge }}
                aside={
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 mr-5 text-sm text-[var(--color-ink-soft)]">
                      <IconBadge icon={Trophy} size={20} />
                      {t.home.copy.intlRecognition}
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
                      <IconBadge icon={BadgeCheck} size={20} />
                      {t.home.copy.judgingIntegrity}
                    </div>
                  </div>
                }
              />
    );
}
