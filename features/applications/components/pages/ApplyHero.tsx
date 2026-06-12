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
        "Official IBPA Beauty Award 2026 participant applications. Submit your portfolio, select your category, and be evaluated by the international jury.",
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
    <section className="relative flex min-h-[52vh] items-end overflow-hidden bg-[var(--color-ink)] pb-0">
      {/* Background image */}
      <Image
        src="/images/editorial/makeup.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-40"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)]/90 via-[var(--color-ink)]/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-[var(--color-ink)]/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--content-width)] px-[var(--page-gutter)] pb-[var(--space-xl)] pt-[clamp(96px,14vh,130px)]">
        <div className="max-w-xl">
          <p className="page-eyebrow text-[var(--color-hover-accent)] [&::before]:bg-[var(--color-hover-accent)]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(2.4rem,5vw,4.2rem)] font-light leading-[1.04] text-white">
            {copy.title}
          </h1>
          <p className="mt-[var(--space-md)] max-w-md text-[clamp(0.95rem,1.5vw,1.05rem)] leading-[1.78] text-white/60">
            {copy.description}
          </p>

          {/* Stats */}
          <div className="mt-[var(--space-lg)] flex flex-wrap gap-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/65"
              >
                {item.label}: <span className="text-white/90 font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-[var(--space-lg)] flex flex-wrap items-center gap-4">
            <a
              href="#apply-form"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] transition hover:bg-white/90"
            >
              {copy.cta} <ArrowRight size={14} />
            </a>
            <Link
              href="/apply/jury"
              className="text-[0.82rem] text-white/50 underline-offset-4 transition hover:text-white hover:underline"
            >
              {copy.juryLink}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
