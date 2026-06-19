"use client";

import JuryApplicationForm from "@/features/jury/components/jury-application/JuryApplicationForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageSection } from "@/shared/components/public";
import Image from "next/image";
import Link from "next/link";

export default function JuryApplyPage() {
  const { t } = useLanguage();

  return (
    <main className="page-shell">
      {/* Light editorial hero */}
      <section className="relative flex min-h-[42vh] items-end overflow-hidden bg-[var(--color-blue-wash)] pb-12 pt-24 md:pt-36">
        <Image
          src="/images/editorial/makeup.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-10"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-off-white)] via-[var(--color-blue-wash)]/70 to-transparent" />

        <div className="relative mx-auto w-full max-w-[var(--content-width)] px-[var(--page-gutter)]">
          <Link
            href="/apply"
            className="mb-4 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
          >
            ← {t.applyPage.intro.title}
          </Link>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
            {t.juryPage.apply.eyebrow}
          </p>
          <h1 className="mt-2 max-w-xl font-[var(--font-title-family)] text-[clamp(2rem,5vw,3.2rem)] font-light leading-[1.1] text-[var(--color-ink)]">
            {t.juryPage.apply.title}
          </h1>
        </div>
      </section>

      <PageSection id="jury-form" className="py-8">
        <JuryApplicationForm />
      </PageSection>
    </main>
  );
}
