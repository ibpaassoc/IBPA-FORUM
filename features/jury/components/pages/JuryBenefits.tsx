"use client";

import {
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  FileBadge2,
  FileHeart,
  Globe2,
  IdCard,
  LayoutDashboard,
  Megaphone,
  Newspaper,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const BENEFIT_ICONS = [
  BadgeCheck,
  BookOpenCheck,
  LayoutDashboard,
  ClipboardCheck,
  IdCard,
  FileHeart,
  FileBadge2,
  Globe2,
  Megaphone,
  Newspaper,
];

export default function JuryBenefits() {
  const { t } = useLanguage();
  const b = t.juryPage.benefits;

  const featuredItems = b.items.slice(0, 4);
  const listItems = b.items.slice(4);

  return (
    <section className="landing-section-strong relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14%] top-[-18%] h-72 w-72 rounded-full bg-[#b9d9eb]/16 blur-2xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="page-eyebrow">{b.eyebrow}</p>

              <h2 className="mt-4 max-w-4xl font-[var(--font-display)] text-[clamp(2.35rem,5vw,4.9rem)] leading-[0.95] tracking-[-0.045em] text-[#10283a]">
                {b.title}
              </h2>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-[#4f6f83] md:text-base">
              {b.description}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredItems.map((item, index) => {
                const Icon = BENEFIT_ICONS[index];

                return (
                  <article
                    key={item}
                    className="group relative min-h-[240px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/66 p-6 shadow-[0_18px_54px_rgba(114,160,193,0.1)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-[#72a0c1]/42 hover:bg-white/80 md:p-7"
                  >
                    <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/45 to-transparent" />
                    <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#b9d9eb]/20 blur-2xl" />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-[#f7fbfd] text-[#72a0c1] shadow-[0_12px_32px_rgba(114,160,193,0.14)]">
                          <Icon size={20} strokeWidth={1.7} />
                        </div>

                        <span className="rounded-full border border-[#b9d9eb]/45 bg-white/70 px-2.5 py-1 text-[0.65rem] font-medium text-[#72a0c1]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <p className="mt-auto pt-12 text-[1rem] leading-7 text-[#2d5066]">
                        {item}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/64 p-4 shadow-[0_18px_54px_rgba(114,160,193,0.1)] backdrop-blur-xl md:p-5">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/45 to-transparent" />

              <div className="relative divide-y divide-[#b9d9eb]/28">
                {listItems.map((item, index) => {
                  const itemIndex = index + 4;
                  const Icon = BENEFIT_ICONS[itemIndex];

                  return (
                    <div
                      key={item}
                      className="group grid gap-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-[#f7fbfd] text-[#72a0c1] shadow-[0_10px_28px_rgba(114,160,193,0.12)]">
                        <Icon size={17} strokeWidth={1.7} />
                      </span>

                      <p className="text-sm leading-7 text-[#2d5066]">
                        {item}
                      </p>

                      <span className="hidden rounded-full border border-[#b9d9eb]/45 bg-white/70 px-2.5 py-1 text-[0.65rem] font-medium text-[#72a0c1] sm:block">
                        {String(itemIndex + 1).padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
