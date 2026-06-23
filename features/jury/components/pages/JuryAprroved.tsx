import { getPublicJuryMembers } from "@/features/jury/server/queries";
import { PageSection } from "@/shared/components/layout/PageShell";
import PublicJuryGrid from "./PublicJuryGrid";

export default async function JuryApproved() {
  const juryMembers = await getPublicJuryMembers();

  if (juryMembers.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-[var(--color-white)] py-4">
      <PageSection>
        <section className="relative space-y-8 md:space-y-10">
          <div className="max-w-5xl">
            <p className="page-eyebrow">Approved Jury</p>

            <div className="mt-(--space-sm) flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-4xl font-(--font-display) text-[clamp(2.35rem,5vw,5.15rem)] leading-[0.95] tracking-[-0.055em] text-(--color-ink)">
                Current IBPA Beauty Award 2026 Jury Members
              </h2>

              <p className="max-w-sm text-sm leading-6 text-[var(--color-ink-soft)] md:text-base">
                Approved experts, educators, founders, and competition judges selected for the IBPA Beauty Award standard.
              </p>
            </div>
          </div>

          <PublicJuryGrid members={juryMembers} />
        </section>
      </PageSection>
    </div>
  );
}
