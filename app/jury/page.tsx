import Image from "next/image";
import JuryBenefits from "@/components/jury/JuryBenefits";
import JuryCta from "@/components/jury/JuryCta";
import JuryFaq from "@/components/jury/JuryFaq";
import JuryHero from "@/components/jury/JuryHero";
import JuryProcess from "@/components/jury/JuryProcess";
import JuryRequirements from "@/components/jury/JuryRequirements";
import JuryResponsibilities from "@/components/jury/JuryResponsibilities";
import { PageCard, PageSection, PageShell } from "@/components/layout/PageShell";
import { getPublicJuryMembers } from "@/lib/jury/service";

export default async function JuryPage() {
  const juryMembers = await getPublicJuryMembers();

  return (
    <PageShell>
      <JuryHero />
      <JuryRequirements />
      <JuryResponsibilities />
      <JuryProcess />
      <JuryBenefits />

      <PageSection className="pb-0">
        <PageCard className="rounded-[2rem] p-6 md:p-8">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              Confirmed Jury
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Paid and approved jurors
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#d9d4ca]">
              Only jurors whose applications have been approved and whose Stripe
              payment has been confirmed appear here publicly.
            </p>
          </div>

          {juryMembers.length > 0 ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {juryMembers.map((member) => {
                const profilePhotoId = member.files[0]?.id;

                return (
                  <article
                    key={member.id}
                    className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.035]"
                  >
                    <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                      <div className="relative min-h-[240px] bg-black/20">
                        {profilePhotoId ? (
                          <Image
                            src={`/api/jury/profile-photo/${profilePhotoId}`}
                            alt={member.fullName}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-white/45">
                            No photo
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                          IBPA Jury
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-white">
                          {member.fullName}
                        </h3>
                        <p className="mt-2 text-sm text-[#e7ddc9]">
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
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-6 py-8 text-sm leading-7 text-[#d9d4ca]/80">
              Approved jury profiles will appear here after payment is confirmed.
            </div>
          )}
        </PageCard>
      </PageSection>

      <JuryFaq />
      <JuryCta />
    </PageShell>
  );
}
