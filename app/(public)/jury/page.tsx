import JuryBenefits from "@/features/jury/components/pages/JuryBenefits";
import JuryCta from "@/features/jury/components/pages/JuryCta";
import JuryFaq from "@/features/jury/components/pages/JuryFaq";
import JuryHero from "@/features/jury/components/pages/JuryHero";
import JuryProcess from "@/features/jury/components/pages/JuryProcess";
import JuryRequirements from "@/features/jury/components/pages/JuryRequirements";
import JuryResponsibilities from "@/features/jury/components/pages/JuryResponsibilities";
import PublicJuryGrid from "@/features/jury/components/pages/PublicJuryGrid";
import { getPublicJuryMembers } from "@/features/jury/server/queries";
import { PageCard, PageSection, PageShell } from "@/shared/components/layout/PageShell";

export default async function JuryPage() {
  const juryMembers = await getPublicJuryMembers();

  return (
    <PageShell>
      <JuryHero />
      <JuryBenefits />
      <JuryResponsibilities />
      <JuryRequirements />
      <JuryProcess />

      <PageSection className="space-y-[var(--space-md)]">
        <PageCard>
          <p className="page-eyebrow">
            Review Timeline
          </p>
          <div className="mt-[var(--space-md)] grid gap-[var(--space-sm)] md:grid-cols-3">
            {[
              ["Application Review", "Up to 14 business days"],
              ["Approval Email", "Sent only after review"],
              ["Activation", "After Stripe payment confirmation"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-off-white)] p-[var(--space-sm)]"
              >
                <p className="text-[clamp(0.65rem,1vw,0.75rem)] uppercase tracking-[0.15em] text-[var(--color-gold)]">
                  {label}
                </p>
                <p className="mt-[var(--space-xs)] text-sm font-medium text-[var(--color-navy)]">{value}</p>
              </div>
            ))}
          </div>
        </PageCard>

        {juryMembers.length > 0 ? (
          <section className="space-y-[var(--space-md)]">
            <div className="max-w-3xl">
              <p className="page-eyebrow">
                Active Panel
              </p>
              <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light text-[var(--color-navy)]">
                Meet approved and paid jury members
              </h2>
              <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-steel)]">
                These professionals completed review, approval, and official jury
                payment confirmation. Public profile photos are available through
                the protected image route when uploaded.
              </p>
            </div>

            <PublicJuryGrid members={juryMembers} />
          </section>
        ) : null}
      </PageSection>

      <JuryFaq />
      <JuryCta />
    </PageShell>
  );
}
