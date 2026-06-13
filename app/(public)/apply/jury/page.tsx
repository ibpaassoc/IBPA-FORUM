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
      {/* Dark editorial hero */}
      <section className="relative flex min-h-[42vh] items-end overflow-hidden bg-[var(--color-ink)] pb-12 pt-36">
        <Image
          src="/images/editorial/makeup.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/60 to-transparent" />

        <div className="relative mx-auto w-full max-w-[var(--content-width)] px-[var(--page-gutter)]">
          <Link
            href="/apply"
            className="mb-4 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/50 transition hover:text-white/80"
          >
            ← {t.applyPage.intro.title}
          </Link>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-hover-accent)]">
            {t.juryPage.apply.eyebrow}
          </p>
          <h1 className="mt-2 max-w-xl font-[var(--font-title-family)] text-[clamp(2rem,5vw,3.2rem)] font-light leading-[1.1] text-white">
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
