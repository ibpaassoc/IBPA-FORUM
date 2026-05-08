import { getPublicJuryMembers } from "@/features/jury/server/queries";
import { PageSection } from "@/shared/components/layout/PageShell";
import PublicJuryGrid from "./PublicJuryGrid";

export default async function JuryApproved() {
  const juryMembers = await getPublicJuryMembers();

  if (juryMembers.length === 0) {
    return null;
  }

  return (
    <div className="bg-(--color-white)">
      <PageSection>
        <section className="space-y-(--space-xl)">
          <div className="max-w-3xl">
            <p className="page-eyebrow">Approved Jury</p>

            <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(2rem,4vw,3.6rem)] leading-[1.05] text-(--color-navy)">
              Meet the IBPA Jury
            </h2>
          </div>

          <PublicJuryGrid members={juryMembers} />
        </section>
      </PageSection>
    </div>
  );
}
