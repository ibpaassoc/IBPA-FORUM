import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

export default function PublicJuryGrid({
  members,
}: {
  members: Array<{
    id: string;
    fullName: string;
    professionalTitle: string;
    city: string;
    country: string;
    expertiseAreas: string[];
    professionalBio: string;
  }>;
}) {
  return (
    <PageSection>
      <div className="grid gap-[var(--space-md)] md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <PageCard key={member.id}>
            <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Active Jury Member
            </p>
            <h3 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-navy)]">{member.fullName}</h3>
            <p className="mt-[var(--space-xs)] text-sm text-[var(--color-steel)]">
              {member.professionalTitle}
            </p>
            <p className="mt-[var(--space-xs)] text-sm text-[var(--color-steel)]">
              {member.city}, {member.country}
            </p>

            <div className="mt-[var(--space-sm)] flex flex-wrap gap-2">
              {member.expertiseAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-[var(--border-default)] bg-[var(--color-off-white)] px-3 py-1 text-xs text-[var(--color-steel)]"
                >
                  {area}
                </span>
              ))}
            </div>

            <p className="mt-[var(--space-md)] text-sm leading-[1.7] text-[var(--color-steel)]">
              {member.professionalBio}
            </p>
          </PageCard>
        ))}
      </div>
    </PageSection>
  );
}
