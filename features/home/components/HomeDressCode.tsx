"use client";

import Image from "next/image";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { StaggerContainer } from "@/shared/components/public";

const dressCodeImages = [
  [
    "/images/dress-code/1.png",
    "/images/dress-code/2.png",
  ],
  [
    "/images/dress-code/3.png",
    "/images/dress-code/4.png",
  ],
  [
    "/images/dress-code/5.png",
    "/images/dress-code/6.png",
  ],
] as const;

export default function HomeDressCode() {
  const { t } = useLanguage();
  const dressCode = t.home.dressCode;

  return (
    <section
      id="dress-code"
      className="section-rhythm-loose overflow-hidden bg-[var(--color-off-white)]"
    >
      <div className="page-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="page-eyebrow">{dressCode.eyebrow}</p>

          <h2 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(3rem,7vw,6.5rem)] font-light uppercase leading-[0.95] tracking-[0.04em] text-[var(--color-ink)]">
            {dressCode.title}
          </h2>

          <p className="mx-auto mt-[var(--space-sm)] max-w-2xl text-[clamp(0.95rem,1.6vw,1.06rem)] leading-[1.8] text-[var(--color-ink-soft)]">
            {dressCode.description}
          </p>
        </div>

        <div className="mt-[var(--space-lg)] flex flex-wrap items-start justify-center gap-x-8 gap-y-6 sm:gap-x-12">
          {dressCode.colors.map((color) => (
            <div
              key={color.label}
              className="flex min-w-20 flex-col items-center gap-3"
            >
              <span
                aria-hidden="true"
                className="h-12 w-12 rounded-full border border-black/5 shadow-[0_8px_24px_rgba(65,42,29,0.08)] sm:h-14 sm:w-14"
                style={{ backgroundColor: color.value }}
              />

              <span className="font-[var(--font-ui-family)] text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                {color.label}
              </span>
            </div>
          ))}
        </div>

        <StaggerContainer
          className="mt-[var(--space-xl)] grid gap-4 lg:grid-cols-3"
          stagger={0.1}
        >
          {dressCode.days.map((day, dayIndex) => (
            <article
              key={day.eyebrow}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] shadow-[var(--shadow-soft)]"
            >
              <div className="border-b border-[var(--border-default)] bg-[var(--surface-muted)] px-4 py-5 text-center">
                <p className="font-[var(--font-title-family)] text-[clamp(1.4rem,2.4vw,2rem)] font-light uppercase leading-none tracking-[0.08em] text-[var(--color-ink)]">
                  {day.eyebrow}
                </p>

                <p className="mt-2 font-[var(--font-ui-family)] text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                  {day.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px bg-[var(--border-default)]">
                {dressCodeImages[dayIndex]?.map((src, imageIndex) => (
                  <div
                    key={src}
                    className="relative aspect-[2/3] overflow-hidden bg-[var(--surface-muted)]"
                  >
                    <Image
                      src={src}
                      alt={`${day.eyebrow} ${day.title} ${
                        imageIndex + 1
                      }`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 17vw"
                      className="object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </StaggerContainer>

        <div className="mt-[var(--space-lg)] rounded-[var(--radius)] bg-[#382115] px-6 py-5 text-center shadow-[var(--shadow-soft)]">
          <p className="font-[var(--font-title-family)] text-sm uppercase tracking-[0.18em] text-[#ead4b5] sm:text-base sm:tracking-[0.24em]">
            {dressCode.footer}
          </p>
        </div>
      </div>
    </section>
  );
}
