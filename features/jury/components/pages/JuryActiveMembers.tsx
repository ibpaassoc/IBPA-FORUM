"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SectionHeading } from "@/shared/components/public";
import { juryInitials } from "@/features/jury/lib/profile-photo";

type JuryMember = {
  id: string;
  fullName: string;
  professionalTitle?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  expertise?: string[] | null;
  profilePhotoSrc?: string | null;
};

function JuryInitialsAvatar({ fullName }: { fullName: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef5f9_48%,#dfeef6_100%)]">
      <span className="font-(--font-display) text-7xl tracking-[-0.06em] text-[#72a0c1]/55">
        {juryInitials(fullName)}
      </span>
    </div>
  );
}

export default function JuryActiveMembers({
  juryMembers,
}: {
  juryMembers: JuryMember[];
}) {
  const { t } = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});

  if (juryMembers.length === 0) return null;

  const getCardStep = (slider: HTMLDivElement) => {
    const card = slider.querySelector<HTMLElement>("[data-jury-card]");
    if (!card) return 420;

    const gap = Number.parseFloat(getComputedStyle(slider).columnGap || "0");
    return card.offsetWidth + (Number.isFinite(gap) ? gap : 0);
  };

  const updateActiveIndex = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const step = getCardStep(slider);
    setActiveIndex(Math.round(slider.scrollLeft / step));
  };

  const scroll = (direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = getCardStep(slider);

    slider.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="JuryCouncil"
      className="landing-section relative overflow-hidden py-20 md:py-28"
    >
      <div className="absolute left-[-10%] top-1/4 h-72 w-72 rounded-full bg-[#b9d9eb]/14 blur-2xl" />

      <div className="page-section relative">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={t.juryPage.copy.approvedEyebrow}
            title={t.juryPage.copy.approvedTitle}
          />

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              aria-label="Previous jury member"
              onClick={() => scroll("prev")}
              className="flex size-11 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#10182a] backdrop-blur-xl transition hover:border-[#72a0c1]/45 hover:bg-white md:size-12"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              aria-label="Next jury member"
              onClick={() => scroll("next")}
              className="flex size-11 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 text-[#10182a] backdrop-blur-xl transition hover:border-[#72a0c1]/45 hover:bg-white md:size-12"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={sliderRef}
        data-jury-slider
        onScroll={updateActiveIndex}
        className="relative flex snap-x snap-mandatory scroll-px-[var(--page-gutter)] gap-5 overflow-x-auto overscroll-x-contain scroll-smooth px-[var(--page-gutter)] pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] md:scroll-px-[max(1rem,calc((100vw-1200px)/2))] md:gap-6 md:px-[max(1rem,calc((100vw-1200px)/2))] [&::-webkit-scrollbar]:hidden"
      >
        {juryMembers.map((member) => {
          const photoSrc =
            member.profilePhotoSrc && !failedPhotos[member.id]
              ? member.profilePhotoSrc
              : null;

          return (
            <article
              key={member.id}
              data-jury-card
              className="group relative w-[calc(100vw-(2*var(--page-gutter)))] max-w-[390px] shrink-0 snap-start overflow-hidden rounded-[2.3rem] border border-[#b9d9eb]/60 bg-white/86 p-2 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 sm:w-[390px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.9rem] bg-[#eef5f9]">
                {photoSrc ? (
                  <Image
                    src={photoSrc}
                    alt={member.fullName}
                    fill
                    unoptimized
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) calc(100vw - (2 * var(--page-gutter))), 390px"
                    onError={() =>
                      setFailedPhotos((current) => ({ ...current, [member.id]: true }))
                    }
                  />
                ) : (
                  <JuryInitialsAvatar fullName={member.fullName} />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,42,0.02)_0%,rgba(16,24,42,0.04)_42%,rgba(16,24,42,0.72)_100%)]" />

                <div className="absolute bottom-4 left-4 right-4 rounded-[1.6rem] border border-white/25 bg-black/35 p-4 text-white backdrop-blur-2xl">
                  <h3 className="font-(--font-display) text-3xl leading-none tracking-[-0.04em]">
                    {member.fullName}
                  </h3>

                  {member.professionalTitle ? (
                    <p className="mt-2 text-sm leading-5 text-white/82">
                      {member.professionalTitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        {juryMembers.map((member, index) => (
          <button
            key={member.id}
            type="button"
            aria-label={`Go to jury member ${index + 1}`}
            onClick={() => {
              const slider = sliderRef.current;
              if (!slider) return;

              slider.scrollTo({
                left: index * getCardStep(slider),
                behavior: "smooth",
              });
            }}
            className={`h-3 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "w-3 bg-[#72a0c1]"
                : "w-3 bg-[#72a0c1]/30 hover:bg-[#72a0c1]/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
