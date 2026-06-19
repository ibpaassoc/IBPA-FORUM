"use client";

import {
  Award,
  BadgeCheck,
  Calendar,
  Camera,
  Globe,
  HeartHandshake,
  Trophy,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeCategoriesRow() {
  const { t } = useLanguage();

  const categoryIconMap = [
    Camera,
    Trophy,
    Award,
    BadgeCheck,
    Globe,
    Users,
    HeartHandshake,
    Calendar,
  ];

  const items = t.home.categoriesPreview.items.slice(0, 8);
  const loopItems = [...items, ...items];

  return (
    <section className="section-rhythm-tight overflow-hidden">
      <div className="page-section">
        <div className="overflow-hidden">
          <div className="flex w-max animate-[marquee_24s_linear_infinite] items-center gap-3 hover:[animation-play-state:paused]">
            {loopItems.map((item, index) => {
              const Icon = categoryIconMap[index % categoryIconMap.length];

              return (
                <a key={`${item}-${index}`} href="/apply">
                  <span
                    className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-tint)] px-4 py-2 text-sm text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]"
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.5}
                      className="text-[var(--color-hover-accent)] transition group-hover:text-[var(--color-blue)]"
                    />
                    {item}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
