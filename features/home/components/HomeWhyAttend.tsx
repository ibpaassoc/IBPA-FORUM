"use client";

import Image from "next/image";
import clsx from "clsx";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

const ITEM_IMAGES = [
  "/images/community/white_group.jpg",
  "/images/events/DSC00272.jpg",
  "/images/events/DSC00932.jpg",
  "/images/events/DSC01248.jpg",
] as const;

const ITEM_ICONS = ["◈", "◇", "◉", "◆"] as const;

export default function HomeWhyAttend() {
  const { t } = useLanguage();
  const wa = t.home.whyAttend;

  return (
    <section className="bg-[var(--color-off-white)]">
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

          return (
            <div
              key={item.title}
              className={clsx(
                "page-section py-[var(--space-xl)]",
                index < wa.items.length - 1 && "border-b border-[var(--border-soft)]"
              )}
            >
              <div
                className={clsx(
                  "grid items-center gap-[var(--space-xl)] lg:grid-cols-2",
                )}
              >
                {/* Image */}
                <Reveal
                  delay={0.05}
                  y={20}
                  className={clsx(isEven ? "lg:order-2" : "lg:order-1")}
                >
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]">
                    <Image
                      src={imgSrc}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    {/* Number overlay */}
                    <div className="absolute right-[var(--space-md)] top-[var(--space-md)] flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-[var(--shadow-sm)]">
                      <span className="font-[var(--font-title-family)] text-[0.8rem] text-[var(--color-ink)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </Reveal>

                {/* Text */}
                <div className={clsx(isEven ? "lg:order-1" : "lg:order-2")}>
                  <Reveal delay={0.1}>
                    <span className="text-[1.2rem] text-[var(--color-hover-accent)] opacity-60">
                      {ITEM_ICONS[index]}
                    </span>
                    <h3 className="mt-3 font-[var(--font-title-family)] text-[clamp(1.8rem,3.5vw,2.8rem)] font-light leading-[1.08] text-[var(--color-ink)]">
                      {item.title}
                    </h3>
                    <div className="mt-[var(--space-md)] flex items-start gap-4">
                      <div className="mt-1 h-px w-8 shrink-0 bg-[var(--color-hover-accent)]/50" />
                      <p className="text-[clamp(0.96rem,1.6vw,1.07rem)] leading-[1.78] text-[var(--color-ink-soft)]">
                        {item.description}
                      </p>
                    </div>
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
