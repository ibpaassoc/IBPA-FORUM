"use client";

import EditorialImageCard from "@/shared/components/media/EditorialImageCard";

type PublicJuryMember = {
  id: string;
  fullName: string;
  professionalTitle?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  expertise?: string[] | null;
  profilePhotoFileId?: string | null;
};

const juryPhotos = [
  "/images/team/sitting_group.jpg",
  "/images/editorial/accending.jpg",
  "/images/community/items.jpg",
  "/images/community/funny.jpg",
];

export default function PublicJuryGrid({
  members,
}: {
  members: PublicJuryMember[];
}) {
  return (
    <div className="grid gap-(--space-lg) sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => (
        <EditorialImageCard
          key={member.id}
          src={juryPhotos[index % juryPhotos.length]}
          alt={`${member.fullName} jury portrait`}
          eyebrow="Active jury member"
          title={member.fullName}
          text={[
            member.professionalTitle,
            member.city || member.country
              ? [member.city, member.country].filter(Boolean).join(", ")
              : null,
          ]
            .filter(Boolean)
            .join(" | ")}
          aspectClassName="aspect-[4/5]"
          objectPosition={index % 2 === 0 ? "center top" : "center 18%"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="group overflow-hidden rounded-[var(--radius)] border border-[var(--border-default)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--color-hover)] hover:shadow-xl"
        >
          <div className="flex flex-wrap gap-2">
            {(member.expertise ?? []).length ? (
              member.expertise!.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs text-white"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs text-white">
                Jury profile
              </span>
            )}
          </div>
        </EditorialImageCard>
      ))}
    </div>
  );
}
