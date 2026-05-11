"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard } from "@/shared/components/layout/PageShell";

export default function JuryProcess() {
  const { t } = useLanguage();

  return (
    <div className="pb-(--space-2xl) bg-(--color-white)">
      <section>
        <div className="mx-auto max-w-(--content-width) px-(--page-gutter) pt-(--space-2xl) pb-(--space-lg)">
          <div className="mb-(--space-lg) max-w-3xl">
            <p className="page-eyebrow">
              {t.juryPage.process.label}
            </p>

            <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.15] text-(--color-navy)">
              {t.juryPage.process.title}
            </h2>
          </div>

          <div className="grid gap-(--space-md) lg:grid-cols-5">
            {t.juryPage.process.steps.map((step) => (
              <div
                key={step.number}
                className="page-card p-(--space-md)"
              >
                <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-(--color-hover)">
                  {step.number}
                </p>

                <h3 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.1rem,2vw,1.6rem)] text-(--color-navy)">
                  {step.title}
                </h3>

                <p className="mt-(--space-sm) text-sm leading-[1.65] text-(--color-steel)">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-(--content-width) px-(--page-gutter)">
          <PageCard>
            <p className="page-eyebrow">
              Review Timeline
            </p>

            <div className="mt-(--space-md) grid gap-(--space-sm) md:grid-cols-3">
              {[
                ["Application Review", "Up to 14 business days"],
                ["Approval Email", "Sent only after review"],
                ["Activation", "After Stripe payment confirmation"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-sm border border-(--border-default) bg-(--color-off-white) p-(--space-sm)"
                >
                  <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-(--color-hover)">
                    {label}
                  </p>

                  <p className="mt-(--space-xs) text-sm font-medium text-(--color-navy)">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </PageCard>
        </div>
      </section>
    </div>
  );
}
