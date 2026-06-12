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
                primary={{ href: "/apply", label: t.common.applyAsParticipant }}
                secondary={{ href: "/jury", label: t.home.cta.judge }}
                aside={
                  <div className="flex flex-col gap-3 min-w-[220px]">
                    <div className="flex items-center gap-3 rounded-[var(--radius)] border border-white/10 bg-white/6 px-4 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <Trophy size={16} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                      </span>
                      <span className="text-sm leading-[1.5] text-white/70">{t.home.copy.intlRecognition}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-[var(--radius)] border border-white/10 bg-white/6 px-4 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <BadgeCheck size={16} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                      </span>
                      <span className="text-sm leading-[1.5] text-white/70">{t.home.copy.judgingIntegrity}</span>
                    </div>
                  </div>
                }
              />
    );
}
