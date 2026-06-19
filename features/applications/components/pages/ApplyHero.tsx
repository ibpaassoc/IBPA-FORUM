"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ApplyHero({
  heroStats,
}: {
  heroStats: Array<{ label: string; value: string }>;
}) {
  const { language } = useLanguage();
  const copy = {
    en: {
      eyebrow: "Participant Applications",
      title: "Submit your award entry.",
      description:
        "Official IBPA Beauty Award 2026 participant applications. Submit your portfolio, select your nominations, and be evaluated by the international jury.",
      cta: "Start application",
      juryLink: "Apply as a judge instead →",
    },
    ru: {
      eyebrow: "Заявки участников",
      title: "Подайте заявку на премию.",
      description:
        "Официальные заявки на IBPA Beauty Award 2026. Отправьте портфолио, выберите категорию и пройдите оценку международного жюри.",
      cta: "Начать заявку",
      juryLink: "Подать заявку как судья →",
    },
    ua: {
      eyebrow: "Заявки учасників",
      title: "Подайте заявку на премію.",
      description:
        "Офіційні заявки на IBPA Beauty Award 2026. Надішліть портфоліо, оберіть категорію та пройдіть оцінювання міжнародного журі.",
      cta: "Розпочати заявку",
      juryLink: "Подати заявку як суддя →",
    },
  }[language];

  return (
    <section className="relative flex min-h-[52vh] items-end overflow-hidden bg-[var(--color-blue-wash)] pb-0">
      {/* Background image — very subtle */}
      <Image
        src="/images/editorial/makeup.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-15"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-blue-wash)]/95 via-[var(--color-blue-wash)]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-off-white)] via-transparent to-[var(--color-blue-wash)]/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--content-width)] px-[var(--page-gutter)] pb-[var(--space-xl)] pt-[clamp(96px,14vh,130px)]">
        <div className="max-w-xl">
          <p className="page-eyebrow">
            {copy.eyebrow}
          </p>
          <h1 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(2.4rem,5vw,4.2rem)] font-light leading-[1.04] text-[var(--color-ink)]">
            {copy.title}
          </h1>
          <p className="mt-[var(--space-md)] max-w-md text-[clamp(0.95rem,1.5vw,1.05rem)] leading-[1.78] text-[var(--color-ink-soft)]">
            {copy.description}
          </p>

          {/* Stats */}
          <div className="mt-[var(--space-lg)] flex flex-wrap gap-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-full border border-[var(--color-blue)]/25 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-soft)]"
              >
                {item.label}: <span className="font-medium text-[var(--color-ink)]">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-[var(--space-lg)] flex flex-wrap items-center gap-4">
            <a
              href="#apply-form"
              className="ibpa-button ibpa-button-blue inline-flex items-center gap-2"
            >
              {copy.cta} <ArrowRight size={14} />
            </a>
            <Link
              href="/apply/jury"
              className="text-[0.82rem] text-[var(--color-ink-soft)] underline-offset-4 transition hover:text-[var(--color-ink)] hover:underline"
            >
              {copy.juryLink}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
