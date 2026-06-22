"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HoverCard, SafeImage, StaggerContainer } from "@/shared/components/public";

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
      approvedMember: "Approved",
      council: "IBPA Jury Council",
      portraitSuffix: "jury portrait",
    },
    ru: {
      approvedMember: "Одобрен",
      council: "Совет жюри IBPA",
      portraitSuffix: "портрет члена жюри",
    },
    ua: {
      approvedMember: "Схвалено",
      council: "Рада журі IBPA",
      portraitSuffix: "портрет члена журі",
    },
  }[language];

  return (
    <StaggerContainer className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" stagger={0.09}>
      {members.map((member, index) => {
        const primaryFallback = juryFallbackPhotos[index % juryFallbackPhotos.length];
        const secondaryFallback = juryFallbackPhotos[(index + 1) % juryFallbackPhotos.length];
        const photoSrc = member.profilePhotoFileId
          ? `/api/jury/profile-photo/${member.profilePhotoFileId}`
          : primaryFallback;
        const memberLocation = [member.city, member.country].filter(Boolean).join(", ");
        const expertise = (member.expertise ?? []).slice(0, 3);

        return (
          <HoverCard key={member.id} className="h-full" lift={-8} scale={1.012}>
            <article
              className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[var(--border-glass)] shadow-[var(--shadow-glass)]"
              style={{ background: "rgba(255,255,255,0.52)", backdropFilter: "blur(20px) saturate(160%)" }}
            >
              {/* Photo */}
              <div className="relative aspect-[4/5] shrink-0 overflow-hidden">
                <SafeImage
                  src={photoSrc}
                  fallbackSrc={primaryFallback}
                  fallbackSrcs={[secondaryFallback]}
                  alt={`${member.fullName} ${copy.portraitSuffix}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  objectPosition="center 20%"
                  mobileObjectPosition="center 16%"
                  className="object-cover"
                  unoptimized={Boolean(member.profilePhotoFileId)}
                />
                {/* Gradient fading photo into card bg — more transparent */}
                <div
                  className="absolute inset-x-0 bottom-0 h-44"
                  style={{
                    background: "linear-gradient(to top, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.50) 34%, transparent 100%)",
                  }}
                />
              </div>

              {/* Content overlapping the fade */}
              <div className="relative -mt-12 flex flex-1 flex-col px-7 pb-8">
                {/* Approved badge */}
                <div className="mb-4 inline-flex items-center gap-2">
                  <span
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-soft)] shadow-[0_0_16px_rgba(114,160,193,0.36)]"
                  >
                    <Check size={10} strokeWidth={3} className="text-[var(--color-ink)]" />
                  </span>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-blue)]">
                    {copy.approvedMember}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-[var(--font-display)] text-[1.65rem] leading-[1.04] tracking-[-0.03em] text-[var(--color-ink)] text-pretty">
                  {member.fullName}
                </h3>

                {/* Title · Location */}
                <p className="mt-2 text-[0.875rem] leading-[1.6] text-[var(--color-ink-soft)]">
                  {[member.professionalTitle, memberLocation].filter(Boolean).join(" · ") ||
                    copy.council}
                </p>

                {/* Expertise tags */}
                {expertise.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {expertise.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] px-3 py-1 text-xs text-[var(--color-ink-soft)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </HoverCard>
        );
      })}
    </StaggerContainer>
  );
}
