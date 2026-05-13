"use client";

import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HoverCard, IconBadge, SafeImage, StaggerContainer } from "@/shared/components/public";

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

const juryFallbackPhotos = [
  "/images/team/sitting_group.jpg",
  "/images/community/DSC09818.jpg",
  "/images/community/items.jpg",
  "/images/events/DSC00947.jpg",
];

export default function PublicJuryGrid({
  members,
}: {
  members: PublicJuryMember[];
}) {
  const { language } = useLanguage();
  const copy = {
    en: {
      approvedMember: "Approved Jury Member",
      council: "IBPA Jury Council",
      portraitSuffix: "jury portrait",
      separator: " | ",
    },
    ru: {
      approvedMember: "Одобренный член жюри",
      council: "Совет жюри IBPA",
      portraitSuffix: "портрет члена жюри",
      separator: " | ",
    },
    ua: {
      approvedMember: "Схвалений член журі",
      council: "Рада журі IBPA",
      portraitSuffix: "портрет члена журі",
      separator: " | ",
    },
  }[language];

  return (
    <StaggerContainer className="grid gap-[var(--space-md)] sm:grid-cols-2 xl:grid-cols-3" stagger={0.1}>
      {members.map((member, index) => {
        const primaryFallback = juryFallbackPhotos[index % juryFallbackPhotos.length];
        const secondaryFallback = juryFallbackPhotos[(index + 1) % juryFallbackPhotos.length];
        const photoSrc =
          member.profilePhotoFileId
            ? `/api/jury/profile-photo/${member.profilePhotoFileId}`
            : primaryFallback;
        const memberLocation = [member.city, member.country].filter(Boolean).join(", ");

        return (
          <HoverCard key={member.id} className="h-full">
            <article className="page-card flex h-full flex-col rounded-[var(--radius)]">
              <div className="editorial-image-frame relative aspect-[4/5] rounded-b-none border-x-0 border-t-0 bg-[var(--surface-muted)]">
                <SafeImage
                  src={photoSrc}
                  fallbackSrc={primaryFallback}
                  fallbackSrcs={[secondaryFallback]}
                  alt={`${member.fullName} ${copy.portraitSuffix}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  objectPosition="center 22%"
                  mobileObjectPosition="center 16%"
                  className="object-cover"
                  unoptimized={Boolean(member.profilePhotoFileId)}
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-[var(--space-md)]">
                <div className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.17em] text-[var(--color-hover)]">
                  <IconBadge icon={BadgeCheck} size={20} />
                  {copy.approvedMember}
                </div>
                <h3 className="text-[clamp(1.25rem,2.2vw,1.7rem)] leading-[1.15] text-[var(--color-ink)]">
                  {member.fullName}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--color-ink-soft)]">
                  {[member.professionalTitle, memberLocation].filter(Boolean).join(copy.separator) ||
                    copy.council}
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {(member.expertise ?? []).slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-tint)] px-3 py-1 text-xs text-[var(--color-ink-soft)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </HoverCard>
        );
      })}
    </StaggerContainer>
  );
}
