import { getPublicJuryMembers } from "@/features/jury/server/queries";
import { PageSection } from "@/shared/components/layout/PageShell";
import PublicJuryGrid from "./PublicJuryGrid";


export default async function JuryApproved() {
    const juryMembers = await getPublicJuryMembers();    
            
    return (
        <div className="bg-(--color-white)">
            <PageSection>
                {juryMembers.length > 0 ? (
                <section className="space-y-(--space-md)">
                    <div className="max-w-3xl">
                    <p className="page-eyebrow">
                        Active Panel
                    </p>
                    <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] text-(--color-navy)">
                        Meet approved and paid jury members
                    </h2>
                    <p className="mt-(--space-sm) text-sm leading-[1.7] text-(--color-steel)">
                        These professionals completed review, approval, and official jury
                        payment confirmation. Public profile photos are available through
                        the protected image route when uploaded.
                    </p>
                    </div>

                    <PublicJuryGrid members={juryMembers} />
                </section>
                ) : null}
            </PageSection>
        </div>
    );
}
