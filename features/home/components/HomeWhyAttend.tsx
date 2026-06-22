"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import clsx from "clsx";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal, PremiumSectionHeader } from "@/shared/components/public";

const ITEM_IMAGES = [
  "/images/community/white_group.jpg",
  "/images/events/DSC00272.jpg",
  "/images/events/DSC00932.jpg",
  "/images/events/DSC01248.jpg",
] as const;

export default function HomeWhyAttend() {
  const { t } = useLanguage();
  const wa = t.home.whyAttend;

  return (
    <section className="bg-white">
      {/* Section header */}
      <div className="page-section section-rhythm-tight pb-0">
        <Reveal>
          <p className="page-eyebrow">{wa.eyebrow}</p>
        </Reveal>
      </div>

      {/* Alternating editorial rows */}
      <div className="flex flex-col">
        {wa.items.map((item, index) => {
          const isEven = index % 2 === 0;
          const imgSrc = ITEM_IMAGES[index];
          // Alternate: white / blue-tint
          const rowStyle: CSSProperties = isEven
            ? { background: "white" }
            : { background: "var(--surface-blue-tint)" };

          return (
            <div
              key={item.title}
              className="relative overflow-hidden"
              style={rowStyle}
            >
              <div className={clsx("page-section py-[var(--space-xl)]")}>
                <div className="grid items-center gap-[var(--space-xl)] lg:grid-cols-2">

                  {/* Image */}
                  <Reveal
                    delay={0.05}
                    y={0}
                    className={clsx(isEven ? "lg:order-2" : "lg:order-1")}
                  >
                    <div className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-glass)] shadow-[var(--shadow-glass)]">
                      <Image
                        src={imgSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      {/* Glass number badge */}
                      <div className="premium-glass-blue absolute right-[var(--space-md)] top-[var(--space-md)] flex h-9 w-9 items-center justify-center rounded-full">
                        <span className="font-[var(--font-title-family)] text-[0.8rem] text-[var(--color-ink)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </Reveal>

                  {/* Text */}
                  <Reveal delay={0.1} className={clsx(isEven ? "lg:order-1" : "lg:order-2")}>
                    <PremiumSectionHeader
                      title={item.title}
                      subtitle={item.description}
                    />
                  </Reveal>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
