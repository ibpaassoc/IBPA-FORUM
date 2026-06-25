import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link"
import Image from "next/image";

export default function JuryApplyHero() {
  const { t } = useLanguage();

  return (
    <section className="landing-section-strong relative flex min-h-[42vh] items-end overflow-hidden pb-12 pt-24 md:pt-36">
      <Image
        src="/images/winners.png"
        alt=""
        fill
        priority
        className="object-cover object-[50%_25%] opacity-15"
      />

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
  )
}
