"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard } from "@/shared/components/layout/PageShell";

export default function ApplyIntroCards() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <PageCard className="rounded-[1.8rem] p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover)]">
          {t.applyPage.introCards.eligibility}
        </p>
        <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-ink-soft)]">
          <p dangerouslySetInnerHTML={{ __html: t.applyPage.introCards.feeHtml }} />
          <p>{t.applyPage.introCards.separate}</p>
          <p>{t.applyPage.introCards.juryNote}</p>
        </div>
      </PageCard>

      <PageCard className="rounded-[1.8rem] p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover)]">
          {t.applyPage.introCards.before}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {t.applyPage.introCards.items.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--color-off-white)] p-4 text-sm leading-6 text-[var(--color-ink)]"
            >
              {item}
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
}
