"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import JuryMenu from "@/shared/components/layout/JuryMenu";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Modal from "@/shared/components/ui/Modal";
import { legalContent } from "@/shared/components/layout/legal-content";

export default function Footer() {
  const { language } = useLanguage();
  const [activeLegalModal, setActiveLegalModal] = useState<"terms" | "privacy" | null>(null);

  const copy = {
    en: {
      about: "About",
      association: "Association",
      aboutAward: "Award",
      timeline: "Timeline",
      juryCouncil: "Jury Council",
      award: "Award",
      categories: "Categories",
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
      copyright: "© 2026 IBPA Beauty Award. All rights reserved.",
      global: "Open to global participants.",
    },
    ru: {
      about: "О проекте",
      association: "Ассоциация",
      aboutAward: "Премия",
      timeline: "Таймлайн",
      juryCouncil: "Совет жюри",
      award: "Премия",
      categories: "Категории",
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
      aboutAward: "Премія",
      timeline: "Таймлайн",
      juryCouncil: "Рада журі",
      award: "Премія",
      categories: "Категорії",
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
        { href: "/#timeline", label: copy.timeline },
        { href: "/jury#JuryCouncil", label: copy.juryCouncil },
      ],
    },
    {
      title: copy.award,
      links: [
        { href: "/categories", label: copy.categories },
        { href: "/jury", label: copy.jury },
        { href: "/grand-prix", label: copy.grandPrix },
        { href: "/apply", label: copy.apply },
      ],
    },
    {
      title: copy.resources,
      links: [
        { href: "/#gallery", label: copy.mediaCentre },
        { href: "mailto:forum-support@ibpassociations.org", label: copy.contact },
        { href: "#", label: copy.terms, legalType: "terms" as const },
        { href: "#", label: copy.privacy, legalType: "privacy" as const },
      ],
    },
  ];

  const currentLegalCopy = legalContent[language];

  return (
    <>
      <footer className="w-full border-t border-[var(--border-default)] bg-[var(--color-off-white)] text-[var(--color-ink-soft)]">
        <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)]">
          {/* Main footer grid */}
          <div className="grid grid-cols-1 gap-[var(--space-xl)] border-b border-[var(--border-default)] py-[var(--space-xl)] md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr]">
            {/* Brand column */}
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/logo_black.png"
                  alt="IBPA Logo"
                  width={320}
                  height={80}
                  className="h-12 w-auto object-contain opacity-85"
                />
              </Link>

              <p className="mt-[var(--space-md)] text-[0.95rem] leading-[1.78] text-[var(--color-ink-soft)]">
                {copy.summary}
              </p>

              <div className="mt-[var(--space-md)]">
                <JuryMenu dropDirection="up" dropAlign="left" />
              </div>
            </div>

            {/* Nav columns */}
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-[var(--space-md)] text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/40">
                  {column.title}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {column.links.map((link) =>
                    link.legalType ? (
                      <button
                        key={link.label}
                        type="button"
                        onClick={() => setActiveLegalModal(link.legalType)}
                        className="w-fit text-left text-[0.9rem] leading-[1.75] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith("mailto:") ? (
                      <a
                        key={link.label}
                        href={link.href}
                        className="text-[0.9rem] leading-[1.75] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith("http") ? (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[0.9rem] leading-[1.75] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-[0.9rem] leading-[1.75] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col gap-3 py-[var(--space-md)] text-[0.75rem] text-[var(--color-ink)]/30 sm:flex-row sm:items-center sm:justify-between">
            <p>{copy.copyright}</p>
            <p className="font-[var(--font-accent-family)] text-[1.1rem] italic text-[var(--color-ink)]/40 leading-[1.2]">
              {copy.global}
            </p>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={activeLegalModal !== null}
        onClose={() => setActiveLegalModal(null)}
        labelledById="legal-modal-title"
        title={
          activeLegalModal === "privacy"
            ? currentLegalCopy.privacy.modalTitle
            : currentLegalCopy.terms.modalTitle
        }
      >
        <div className="space-y-[var(--space-md)]">
          {(activeLegalModal === "privacy"
            ? currentLegalCopy.privacy.sections
            : currentLegalCopy.terms.sections
          ).map((section) => (
            <section
              key={section.heading}
              className="rounded-[var(--radius-sm)] border border-transparent px-[clamp(0.05rem,0.6vw,0.5rem)] py-[clamp(0.2rem,0.7vw,0.55rem)] transition hover:border-[var(--border-soft)] hover:bg-[var(--surface-tint)]"
            >
              <h3 className="mb-1 text-[clamp(1.08rem,1.5vw,1.25rem)] leading-[1.25] tracking-[0.005em] text-[var(--color-ink)] [font-family:var(--font-accent-family)]">
                {section.heading}
              </h3>
              <p className="text-[var(--color-ink-soft)]">{section.body}</p>
            </section>
          ))}
        </div>
      </Modal>
    </>
  );
}
