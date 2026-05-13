"use client";

import Image from "next/image";
import Link from "next/link";
import JuryMenu from "@/shared/components/layout/JuryMenu";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Footer() {
  const { language, t } = useLanguage();

  const copy = {
    en: {
      about: "About",
      association: "Association",
      aboutAward: "About the Award",
      timeline: "Timeline",
      juryCouncil: "Jury Council",
      award: "Award",
      directions: "Directions",
      jury: "Jury",
      grandPrix: "Grand Prix",
      apply: "Apply",
      resources: "Resources",
      mediaCentre: "Media Centre",
      contact: "Contact",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      summary:
        "Celebrating excellence in the global beauty industry and recognizing professionals shaping the future of beauty.",
      copyright: "Copyright 2026 IBPA Beauty Award. All rights reserved.",
      global: "Open to global participants.",
    },
    ru: {
      about: "О проекте",
      association: "Ассоциация",
      aboutAward: "О премии",
      timeline: "Таймлайн",
      juryCouncil: "Совет жюри",
      award: "Премия",
      directions: "Направления",
      jury: "Жюри",
      grandPrix: "Гран-при",
      apply: "Подать заявку",
      resources: "Ресурсы",
      mediaCentre: "Медиацентр",
      contact: "Контакт",
      terms: "Условия использования",
      privacy: "Политика конфиденциальности",
      summary:
        "Мы отмечаем достижения в мировой индустрии красоты и поддерживаем специалистов, формирующих ее будущее.",
      copyright: "© 2026 IBPA Beauty Award. Все права защищены.",
      global: "Открыто для участников со всего мира.",
    },
    ua: {
      about: "Про проєкт",
      association: "Асоціація",
      aboutAward: "Про премію",
      timeline: "Таймлайн",
      juryCouncil: "Рада журі",
      award: "Премія",
      directions: "Напрямки",
      jury: "Журі",
      grandPrix: "Гран-прі",
      apply: "Подати заявку",
      resources: "Ресурси",
      mediaCentre: "Медіацентр",
      contact: "Контакт",
      terms: "Умови використання",
      privacy: "Політика конфіденційності",
      summary:
        "Ми відзначаємо досягнення у світовій індустрії краси та підтримуємо фахівців, які формують її майбутнє.",
      copyright: "© 2026 IBPA Beauty Award. Усі права захищені.",
      global: "Відкрито для учасників з усього світу.",
    },
  }[language];

  const footerColumns = [
    {
      title: copy.about,
      links: [
        { href: "https://ibpassociations.org/about", label: copy.association },
        { href: "/", label: copy.aboutAward },
        { href: "/grand-prix", label: copy.timeline },
        { href: "/jury", label: copy.juryCouncil },
      ],
    },
    {
      title: copy.award,
      links: [
        { href: "/directions", label: copy.directions },
        { href: "/jury", label: copy.jury },
        { href: "/grand-prix", label: copy.grandPrix },
        { href: "/apply", label: copy.apply },
      ],
    },
    {
      title: copy.resources,
      links: [
        { href: "/directions", label: copy.mediaCentre },
        { href: "mailto:info@ibpa-awards.com", label: copy.contact },
        { href: "/", label: copy.terms },
        { href: "/", label: copy.privacy },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-(--border-default) bg-(--surface-muted) py-(--space-xl) pb-(--space-lg) text-(--color-ink-soft)">
      <div className="mx-auto max-w-(--content-width) px-(--page-gutter)">
        <div className="grid grid-cols-1 gap-(--space-lg) border-b border-border-footer pb-(--space-lg) md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo_black.png"
                alt="IBPA Logo"
                width={320}
                height={80}
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mt-(--space-md) text-[clamp(0.92rem,1.45vw,1.04rem)] leading-[1.78] text-(--color-ink-soft)">
              {copy.summary}
            </p>

            <div className="mt-(--space-md) flex flex-wrap gap-3">
              <JuryMenu className="ibpa-button-ghost" />
              <Link href="/apply" className="ibpa-button ibpa-button-gold">
                {t.common.applyNow}
              </Link>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-(--space-sm) font-(--font-sans) text-[0.72rem] font-semibold uppercase tracking-[0.17em] text-(--color-hover)">
                {column.title}
              </h4>
              <div className="flex flex-col gap-2">
                {column.links.map((link) =>
                  link.href.startsWith("mailto:") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-[0.95rem] leading-[1.75] text-(--color-ink-soft) transition hover:text-(--color-hover)"
                    >
                      {link.label}
                    </a>
                  ) : link.href.startsWith("http") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[0.95rem] leading-[1.75] text-(--color-ink-soft) transition hover:text-(--color-hover)"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-[0.95rem] leading-[1.75] text-(--color-ink-soft) transition hover:text-(--color-hover)"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}

          <div>
            <h4 className="mb-(--space-sm) font-(--font-sans) text-[0.72rem] font-semibold uppercase tracking-[0.17em] text-(--color-hover)">
              {copy.contact}
            </h4>
            <a
              href="mailto:forum-support@ibpassociations.org"
              className="break-words text-[0.95rem] leading-[1.75] text-(--color-ink-soft) transition hover:text-(--color-hover)"
            >
              forum-support@ibpassociations.org
            </a>
          </div>
        </div>

        <div className="mt-(--space-md) flex flex-col gap-(--space-sm) text-[0.78rem] text-(--color-ink-muted) sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.copyright}</p>
          <p className="script-accent text-[1.35rem] leading-[1.2]">{copy.global}</p>
        </div>
      </div>
    </footer>
  );
}
