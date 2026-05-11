"use client";

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

export default function PublicJuryGrid({
  members,
}: {
  members: PublicJuryMember[];
}) {
  return (
    <div className="grid gap-(--space-lg) sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <article
          key={member.id}
          className="group overflow-hidden rounded-[var(--radius)] border border-[var(--border-default)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--color-hover)] hover:shadow-xl"
        >
          <div className="relative aspect-4/5 overflow-hidden bg-[var(--color-mist)]">
            {member.profilePhotoFileId ? (
              <img
                src={`/api/jury/profile-photo/${member.profilePhotoFileId}`}
                alt={`${member.fullName} jury profile photo`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.25em] text-(--color-hover)">
                No Photo
              </div>
            )}
          </div>

          <div className="space-y-4 p-(--space-md)">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-(--color-hover)">
                Active Jury Member
              </p>

              <h3 className="mt-2 font-(--font-display) text-2xl text-(--color-ink)">
                {member.fullName}
              </h3>

              {member.professionalTitle ? (
                <p className="mt-1 text-sm font-medium text-(--color-ink-soft)">
                  {member.professionalTitle}
                </p>
              ) : null}

              {member.city || member.country ? (
                <p className="mt-1 text-sm text-(--color-ink-soft)">
                  {[member.city, member.country].filter(Boolean).join(", ")}
                </p>
              ) : null}
            </div>

            {member.expertise?.length ? (
              <div className="flex flex-wrap gap-2">
                {member.expertise.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-(--border-default) bg-(--color-off-white) px-3 py-1 text-xs text-(--color-ink)"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
