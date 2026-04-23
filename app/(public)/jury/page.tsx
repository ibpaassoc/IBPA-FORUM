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

      <PageSection className="space-y-6">
        <PageCard className="rounded-3xl p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
            Review Timeline
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["Application Review", "Up to 14 business days"],
              ["Approval Email", "Sent only after review"],
              ["Activation", "After Stripe payment confirmation"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </PageCard>

        {juryMembers.length > 0 ? (
          <section className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Active Panel
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Meet approved and paid jury members
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#d9d4ca]">
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
