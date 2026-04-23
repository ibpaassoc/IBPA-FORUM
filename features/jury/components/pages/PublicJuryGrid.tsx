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
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <PageCard key={member.id} className="rounded-3xl p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
              Active Jury Member
            </p>
            <h3 className="mt-4 text-2xl font-semibold text-white">{member.fullName}</h3>
            <p className="mt-2 text-sm text-[#d9d4ca]">
              {member.professionalTitle}
            </p>
            <p className="mt-1 text-sm text-[#d9d4ca]/75">
              {member.city}, {member.country}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {member.expertiseAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs text-[#d9d4ca]"
                >
                  {area}
                </span>
              ))}
            </div>

            <p className="mt-5 text-sm leading-7 text-[#d9d4ca]">
              {member.professionalBio}
            </p>
          </PageCard>
        ))}
      </div>
    </PageSection>
  );
}
