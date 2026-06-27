"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const { language } = useLanguage();

  const copy = {
    en: {
      approvedMember: "Approved",
      council: "IBPA Jury Council",
      portraitSuffix: "jury portrait",
      previous: "Previous jury member",
      next: "Next jury member",
      scrollHint: "Swipe to view jury members",
    },
    ru: {
      approvedMember: "Одобрен",
      council: "Совет жюри IBPA",
      portraitSuffix: "портрет члена жюри",
      previous: "Предыдущий член жюри",
      next: "Следующий член жюри",
      scrollHint: "Листайте, чтобы увидеть жюри",
    },
    ua: {
      approvedMember: "Схвалено",
      council: "Рада журі IBPA",
      portraitSuffix: "портрет члена журі",
      previous: "Попередній член журі",
      next: "Наступний член журі",
      scrollHint: "Гортайте, щоб побачити журі",
    },
  }[language];

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    const currentScroll = container.scrollLeft;

    setCanScrollPrev(currentScroll > 8);
    setCanScrollNext(currentScroll < maxScroll - 8);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollState();

    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [members.length, updateScrollState]);

  const scrollCards = (direction: "prev" | "next") => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.querySelector<HTMLElement>("[data-jury-card]");
    const cardWidth = card?.offsetWidth ?? 390;
    const gap = window.innerWidth >= 768 ? 24 : 18;

    container.scrollBy({
      left: direction === "next" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth",
    });
  };

  const arrowButtonClass =
    "group flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition";

  const activeArrowClass =
    "border-[var(--color-blue-soft)]/90 bg-white/80 text-[var(--color-ink)] hover:-translate-y-0.5 hover:bg-white";

  const disabledArrowClass =
    "cursor-not-allowed border-[rgba(37,42,45,0.08)] bg-white/45 text-[var(--color-ink-muted)] opacity-55";

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-end gap-3">
        <button
          type="button"
          aria-label={copy.previous}
          disabled={!canScrollPrev}
          onClick={() => scrollCards("prev")}
          className={`${arrowButtonClass} ${
            canScrollPrev ? activeArrowClass : disabledArrowClass
          }`}
        >
          <ArrowLeft
            size={16}
            className={canScrollPrev ? "transition group-hover:-translate-x-0.5" : ""}
          />
        </button>

        <button
          type="button"
          aria-label={copy.next}
          disabled={!canScrollNext}
          onClick={() => scrollCards("next")}
          className={`${arrowButtonClass} ${
            canScrollNext ? activeArrowClass : disabledArrowClass
          }`}
        >
          <ArrowRight
            size={16}
            className={canScrollNext ? "transition group-hover:translate-x-0.5" : ""}
          />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="-mx-4 overflow-x-auto scroll-smooth overscroll-x-contain [scrollbar-width:none] md:-mx-8 [&::-webkit-scrollbar]:hidden"
      >
        <StaggerContainer
          stagger={0.07}
          className="flex snap-x snap-mandatory gap-[18px] px-4 pb-1 pt-2 md:gap-6 md:px-8"
        >
          {members.map((member, index) => {
            const primaryFallback = juryFallbackPhotos[index % juryFallbackPhotos.length];
            const secondaryFallback =
              juryFallbackPhotos[(index + 1) % juryFallbackPhotos.length];

            const photoSrc = member.profilePhotoFileId
              ? `/api/jury/profile-photo/${member.profilePhotoFileId}`
              : primaryFallback;

            const memberLocation = [member.city, member.country]
              .filter(Boolean)
              .join(", ");

            const details =
              [member.professionalTitle, memberLocation].filter(Boolean).join(" · ") ||
              copy.council;

            const expertise = (member.expertise ?? []).slice(0, 3);

            return (
              <HoverCard
                key={member.id}
                lift={-3}
                scale={1.003}
                className="w-[82vw] shrink-0 snap-center sm:w-[380px] lg:w-[392px]"
              >
                <article
                  data-jury-card
                  className="group relative h-[520px] overflow-hidden rounded-[30px] border border-white/70 bg-white/50 backdrop-blur-xl transition duration-200 hover:border-[var(--color-blue-soft)]/80"
                >
                  <SafeImage
                    src={photoSrc}
                    fallbackSrc={primaryFallback}
                    fallbackSrcs={[secondaryFallback]}
                    alt={`${member.fullName} ${copy.portraitSuffix}`}
                    fill
                    sizes="(max-width: 768px) 82vw, 392px"
                    objectPosition="center 17%"
                    mobileObjectPosition="center 15%"
                    className="object-cover transition duration-300 ease-out group-hover:scale-[1.01]"
                    unoptimized={Boolean(member.profilePhotoFileId)}
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_38%,rgba(255,255,255,0.08)_58%,rgba(255,255,255,0.68)_84%,rgba(255,255,255,0.92)_100%)]" />

                  <div className="absolute inset-x-4 bottom-4 z-10">
                    <div className="rounded-[24px] border border-white/75 bg-white/68 px-4 py-4 backdrop-blur-[18px]">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-2.5 py-1">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-blue-soft)]">
                          <Check
                            size={9}
                            strokeWidth={3}
                            className="text-[var(--color-ink)]"
                          />
                        </span>
                        <span className="text-[0.54rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                          {copy.approvedMember}
                        </span>
                      </div>

                      <h3 className="font-[var(--font-display)] text-[clamp(1.45rem,2vw,1.9rem)] leading-[1] tracking-[-0.04em] text-[var(--color-ink)] text-pretty">
                        {member.fullName}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-[0.8rem] leading-[1.55] text-[var(--color-ink-soft)]">
                        {details}
                      </p>

                      {expertise.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {expertise.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-[var(--color-blue-soft)]/85 bg-white/64 px-2.5 py-1 text-[0.66rem] text-[var(--color-ink-soft)]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </HoverCard>
            );
          })}
        </StaggerContainer>
      </div>

      <p className="mt-3 text-center text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]/70 md:hidden">
        {copy.scrollHint}
      </p>
    </div>
  );
}
