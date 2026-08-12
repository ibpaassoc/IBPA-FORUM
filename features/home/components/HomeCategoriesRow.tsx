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
      {/* Full-screen width strip — no page-section padding */}
      <div className="w-screen overflow-hidden border-y border-[var(--border-glass)] bg-white py-[clamp(1.2rem,2.5vw,2rem)]">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-4 hover:[animation-play-state:paused]">
          {loopItems.map((item, index) => {
            const Icon = categoryIconMap[index % categoryIconMap.length];

            return (
              <a key={`${item}-${index}`} href="/account/login">
                <span
                  className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--border-glass)] bg-white px-5 py-2.5 text-sm font-[var(--font-ui-family)] font-medium tracking-[0.04em] text-[var(--color-ink-soft)] transition-all duration-300 hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white"
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className="text-[var(--color-hover-accent)] transition-colors duration-300 group-hover:text-white"
                  />
                  {item}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
