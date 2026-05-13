"use client";

import clsx from "clsx";
import { Camera, Sparkles } from "lucide-react";
import {
  FadeUp,
  IconBadge,
  PageSection,
  SafeImage,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";

type EventExperienceCollageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCaption: string;
  audienceCaption: string;
  detailCaption: string;
  stageCaption: string;
  ambienceLabel: string;
  liveLabel: string;
};

type CollageCardProps = {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  sizes: string;
  objectPosition?: string;
  mobileObjectPosition?: string;
  badge?: string;
};

const fallbackChain = [
  "/images/events/DSC09822.jpg",
  "/images/events/DSC00313.jpg",
  "/images/events/DSC00934.jpg",
  "/images/events/DSC00192.jpg",
];

function CollageCard({
  src,
  alt,
  caption,
  className,
  sizes,
  objectPosition,
  mobileObjectPosition,
  badge,
}: CollageCardProps) {
  return (
    <article className={clsx("page-card relative overflow-hidden rounded-[var(--radius-lg)]", className)}>
      <div className="relative h-full w-full">
        <SafeImage
          src={src}
          fallbackSrcs={fallbackChain}
          alt={alt}
          fill
          sizes={sizes}
          objectPosition={objectPosition}
          mobileObjectPosition={mobileObjectPosition}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,24,0.03)_36%,rgba(11,18,24,0.5)_100%)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-[var(--space-md)] text-white">
        {badge ? (
          <span className="inline-flex rounded-full border border-white/40 bg-[rgba(255,255,255,0.2)] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white">
            {badge}
          </span>
        ) : null}
        <p className={clsx("text-sm leading-[1.65] text-white/95", badge ? "mt-2" : "")}>{caption}</p>
      </div>
    </article>
  );
}

export default function EventExperienceCollage({
  eyebrow,
  title,
  description,
  primaryCaption,
  audienceCaption,
  detailCaption,
  stageCaption,
  ambienceLabel,
  liveLabel,
}: EventExperienceCollageProps) {
  return (
    <PageSection>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />

      <div className="mt-[var(--space-lg)] hidden lg:grid lg:auto-rows-[minmax(7.2rem,1fr)] lg:grid-cols-12 lg:gap-[var(--space-md)]">
        <FadeUp className="col-span-7 row-span-3">
          <CollageCard
            src="/images/events/DSC09822.jpg"
            alt="IBPA premium event badges and credentials"
            caption={primaryCaption}
            badge={ambienceLabel}
            className="h-full"
            sizes="(max-width: 1400px) 58vw, 52vw"
            objectPosition="center 56%"
            mobileObjectPosition="center 52%"
          />
        </FadeUp>

        <FadeUp className="col-span-5 row-span-2">
          <CollageCard
            src="/images/events/DSC00313.jpg"
            alt="Audience and jury members during the IBPA program"
            caption={audienceCaption}
            badge={liveLabel}
            className="h-full"
            sizes="(max-width: 1400px) 36vw, 32vw"
            objectPosition="center 34%"
            mobileObjectPosition="center 24%"
          />
        </FadeUp>

        <FadeUp className="col-span-3 row-span-1">
          <CollageCard
            src="/images/events/DSC00934.jpg"
            alt="IBPA award trophies and ceremony details"
            caption={detailCaption}
            className="h-full"
            sizes="(max-width: 1400px) 24vw, 20vw"
            objectPosition="center 34%"
            mobileObjectPosition="center 22%"
          />
        </FadeUp>

        <FadeUp className="col-span-2 row-span-1">
          <CollageCard
            src="/images/events/DSC00192.jpg"
            alt="Stage atmosphere and live award coverage at IBPA"
            caption={stageCaption}
            className="h-full"
            sizes="(max-width: 1400px) 16vw, 14vw"
            objectPosition="center 28%"
            mobileObjectPosition="center 21%"
          />
        </FadeUp>

        <FadeUp className="col-span-2 row-span-1">
          <div className="page-card flex h-full flex-col justify-between rounded-[var(--radius-lg)] border-[var(--border-strong)] bg-[linear-gradient(165deg,#f8fbfe_0%,#eef6fb_100%)] p-[var(--space-md)]">
            <div className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--color-hover)]">
              <IconBadge icon={Camera} size={20} />
              {eyebrow}
            </div>
            <p className="mt-3 text-sm leading-[1.72] text-[var(--color-ink-soft)]">{description}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--color-ink)]">
              <IconBadge icon={Sparkles} size={20} />
              {ambienceLabel}
            </div>
          </div>
        </FadeUp>
      </div>

      <div className="mt-[var(--space-lg)] lg:hidden">
        <StaggerContainer className="-mx-[var(--page-gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--page-gutter)] pb-2">
          <div className="w-[82vw] shrink-0 snap-start">
            <CollageCard
              src="/images/events/DSC09822.jpg"
              alt="IBPA premium event badges and credentials"
              caption={primaryCaption}
              badge={ambienceLabel}
              className="aspect-[5/4]"
              sizes="82vw"
              objectPosition="center 54%"
              mobileObjectPosition="center 52%"
            />
          </div>
          <div className="w-[72vw] shrink-0 snap-start">
            <CollageCard
              src="/images/events/DSC00313.jpg"
              alt="Audience and jury members during the IBPA program"
              caption={audienceCaption}
              badge={liveLabel}
              className="aspect-[4/5]"
              sizes="72vw"
              objectPosition="center 31%"
              mobileObjectPosition="center 22%"
            />
          </div>
          <div className="w-[72vw] shrink-0 snap-start">
            <CollageCard
              src="/images/events/DSC00934.jpg"
              alt="IBPA award trophies and ceremony details"
              caption={detailCaption}
              className="aspect-[4/5]"
              sizes="72vw"
              objectPosition="center 34%"
              mobileObjectPosition="center 22%"
            />
          </div>
          <div className="w-[72vw] shrink-0 snap-start">
            <CollageCard
              src="/images/events/DSC00192.jpg"
              alt="Stage atmosphere and live award coverage at IBPA"
              caption={stageCaption}
              className="aspect-[4/5]"
              sizes="72vw"
              objectPosition="center 28%"
              mobileObjectPosition="center 22%"
            />
          </div>
        </StaggerContainer>
      </div>
    </PageSection>
  );
}
