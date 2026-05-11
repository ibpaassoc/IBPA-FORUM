"use client";

import Link from "next/link"
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryCta() {
  const { t } = useLanguage();

  return (
    <section className="bg-(--color-blue-wash)">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <div>
          <p className="page-eyebrow">
            {t.juryPage.cta.label}
          </p>

          <h2 className="mt-[var(--space-sm)] max-w-2xl font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.15] text-(--color-ink)">
            {t.juryPage.cta.title}
          </h2>

          <p className="mt-[var(--space-sm)] max-w-2xl text-sm leading-[1.7] text-(--color-ink-soft)">
            {t.juryPage.cta.text}
          </p>

          <Link
            href="/apply/jury"
            className="ibpa-button ibpa-button-gold mt-[var(--space-lg)]"
          >
            {t.juryPage.cta.button}
          </Link>
        </div>
      </div>
    </section>
  )
}
