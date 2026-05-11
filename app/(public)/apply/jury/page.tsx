"use client";

import JuryApplicationForm from "@/features/jury/components/jury-application/JuryApplicationForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageSection, PageShell } from "@/shared/components/layout/PageShell";

export default function JuryApplyPage() {
  const { t } = useLanguage();

  return (
    <PageShell>
      <PageSection className="pt-28 pb-8">
        <div className="mx-auto mb-[var(--space-lg)] max-w-3xl rounded-t-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-blue-wash)] px-[var(--space-xl)] py-[var(--space-lg)]">
          <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-title-accent)]">
            {t.juryPage.apply.eyebrow}
          </p>
          <h1 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-[1.1] text-[var(--color-ink)]">
            {t.juryPage.apply.title}
          </h1>
          <p className="mt-[var(--space-sm)] max-w-2xl text-sm leading-[1.7] text-[var(--color-ink-soft)] sm:text-base">
            {t.juryPage.apply.text}
          </p>
        </div>
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <JuryApplicationForm />
      </PageSection>
    </PageShell>
  );
}
