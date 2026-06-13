"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function SiteUnderDevelopmentPage() {
  const { language } = useLanguage();
  const copy = {
    en: {
      eyebrow: "Website Update",
      title: "We are currently updating the IBPA Beauty Award website.",
      description:
        "Our team is refining the platform ahead of the 2026 award season. Jury applications remain open.",
      applyLabel: "Apply as Jury Member",
      contact: "Questions? Contact us at",
      email: "info@ibpa.beauty",
    },
    ru: {
      eyebrow: "Обновление сайта",
      title: "Мы обновляем сайт IBPA Beauty Award.",
      description:
        "Команда дорабатывает платформу перед сезоном премии 2026 года. Приём заявок в жюри продолжается.",
      applyLabel: "Подать заявку в жюри",
      contact: "Вопросы? Напишите нам:",
      email: "info@ibpa.beauty",
    },
    ua: {
      eyebrow: "Оновлення сайту",
      title: "Ми оновлюємо сайт IBPA Beauty Award.",
      description:
        "Команда вдосконалює платформу перед сезоном премії 2026 року. Прийом заявок до журі триває.",
      applyLabel: "Подати заявку до журі",
      contact: "Питання? Напишіть нам:",
      email: "info@ibpa.beauty",
    },
  }[language];

  return (
    <main className="page-shell flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="text-[clamp(0.62rem,1vw,0.72rem)] font-medium uppercase tracking-[0.22em] text-(--color-hover-accent)">
          {copy.eyebrow}
        </p>

        <h1 className="mt-5 font-(--font-display) text-[clamp(1.6rem,4vw,2.6rem)] font-semibold leading-[1.15] tracking-[-0.01em] text-(--color-ink)">
          {copy.title}
        </h1>

        <p className="mt-5 text-[clamp(0.9rem,1.4vw,1.05rem)] leading-[1.75] text-(--color-ink-soft)">
          {copy.description}
        </p>

        <div className="mt-10">
          <Link
            href="/apply/jury"
            className="ibpa-button ibpa-button-primary inline-flex items-center gap-2"
          >
            {copy.applyLabel}
          </Link>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-(--color-ink-soft)">
          {copy.contact}{" "}
          <a
            href={`mailto:${copy.email}`}
            className="underline underline-offset-2 transition hover:text-(--color-ink)"
          >
            {copy.email}
          </a>
        </p>
      </div>
    </main>
  );
}
