"use client";

import { useState } from "react";
import clsx from "clsx";
import { ImageContainer } from "@/shared/components/public";

const HorizontalGalleryImages = [
  "/images/gallery/0K9A3130.jpg",
  "/images/gallery/0K9A4883.jpg",
  "/images/gallery/0K9A4722.jpg",
  "/images/gallery/0K9A4980.jpg",
  "/images/gallery/0K9A3333.jpg",
  "/images/gallery/0K9A3699.jpg",
  "/images/gallery/0K9A3282.jpg",
  "/images/gallery/DSC00103.jpg",
  "/images/gallery/DSC00206.jpg",
  "/images/gallery/DSC00267.jpg",
  "/images/gallery/DSC01330.jpg",
  "/images/gallery/DSC01427.jpg",
  "/images/gallery/DSC00276.jpg",
  "/images/gallery/DSC00598.jpg",
  "/images/gallery/DSC00363.jpg",
  "/images/gallery/DSC09871.jpg",
  "/images/gallery/DSCF8107.JPG",
  "/images/gallery/DSCF7691.jpg",
  "/images/gallery/DSCF7738.jpg",
  "/images/gallery/DSCF7872.jpg",
  "/images/gallery/DSCF8023.jpg",
  "/images/gallery/DSCF7871.jpg",
];

const VerticalGalleryImages = [
  "/images/gallery/0K9A2667.jpg",
  "/images/gallery/0K9A2829.jpg",
  "/images/gallery/0K9A2843.jpg",
  "/images/gallery/0K9A3107.jpg",
  "/images/gallery/0K9A3233.jpg",
  "/images/gallery/0K9A3366.jpg",
  "/images/gallery/0K9A3424.jpg",
  "/images/gallery/0K9A3727.jpg",
  "/images/gallery/0K9A3758.jpg",
  "/images/gallery/0K9A4184.jpg",
  "/images/gallery/0K9A4753.jpg",
  "/images/gallery/0K9A4986.jpg",
  "/images/gallery/0K9A5007.jpg",
  "/images/gallery/DSC00254.jpg",
  "/images/gallery/DSC00553.jpg",
  "/images/gallery/DSC00430.jpg",
  "/images/gallery/DSC00632.jpg",
  "/images/gallery/DSC00985.jpg",
  "/images/gallery/DSC01176.jpg",
  "/images/gallery/DSC01179.jpg",
  "/images/gallery/DSC09827.jpg",
  "/images/gallery/DSC09930.jpg",
  "/images/gallery/DSC09936.jpg",
  "/images/gallery/DSCF7662.jpg",
  "/images/gallery/DSCF7663.jpg",
  "/images/gallery/DSCF7693.jpg",
];

const directions = ["marquee-left", "marquee-right", "marquee-left"] as const;
const durations = ["84s", "92s", "86s"] as const;
const aboveFoldImageSources = new Set([
  "/images/gallery/0K9A4722.jpg",
  "/images/gallery/0K9A2667.jpg",
]);
const horizontalRowA = HorizontalGalleryImages.filter((_, index) => index % 2 === 0);
const horizontalRowB = HorizontalGalleryImages.filter((_, index) => index % 2 !== 0);

const galleryRows = [
  {
    images: horizontalRowA,
    cardClassName:
      "h-[12.5rem] w-[16rem] sm:h-[14.5rem] sm:w-[20rem] lg:h-[16.25rem] lg:w-[24rem] xl:h-[17.75rem] xl:w-[27rem]",
  },
  {
    images: VerticalGalleryImages,
    cardClassName:
      "h-[16.5rem] w-[11rem] sm:h-[20rem] sm:w-[13rem] lg:h-[23rem] lg:w-[15rem] xl:h-[25rem] xl:w-[16rem]",
  },
  {
    images: horizontalRowB,
    cardClassName:
      "h-[12.5rem] w-[16rem] sm:h-[14.5rem] sm:w-[20rem] lg:h-[16.25rem] lg:w-[24rem] xl:h-[17.75rem] xl:w-[27rem]",
  },
] as const;

function GalleryImageCard({
  src,
  cardClassName,
  eager,
}: {
  src: string;
  cardClassName: string;
  eager: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  return (
    <figure
      className={clsx(
        "sliding-gallery-card relative shrink-0 overflow-hidden rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-sm)]",
        cardClassName
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 z-[1] rounded-[inherit] border border-transparent bg-[linear-gradient(150deg,rgba(242,247,252,0.92)_0%,rgba(231,239,246,0.94)_100%)] transition-opacity duration-300",
          isLoaded && !hasLoadError ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />
      <ImageContainer
        src={src}
        alt="IBPA gallery photo"
        fill
        loading={eager ? "eager" : "lazy"}
        quality={75}
        sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, (max-width: 1280px) 384px, 432px"
        className="absolute inset-0"
        imageClassName={clsx(
          "object-cover transition-opacity duration-300",
          isLoaded && !hasLoadError ? "opacity-100" : "opacity-0"
        )}
        enableLightbox={!hasLoadError}
        onLoad={() => {
          setIsLoaded(true);
          setHasLoadError(false);
        }}
        onError={() => {
          setIsLoaded(false);
          setHasLoadError(true);
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[HomeSlidingGallery] Failed to load image: ${src}`);
          }
        }}
      />
      {hasLoadError ? (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-[linear-gradient(150deg,rgba(242,247,252,0.95)_0%,rgba(231,239,246,0.98)_100%)]">
          <span className="rounded-full border border-[var(--border-soft)] bg-[rgba(255,255,255,0.72)] px-3 py-1 text-[0.62rem] uppercase tracking-[0.17em] text-[var(--color-ink-muted)]">
            Photo unavailable
          </span>
        </div>
      ) : null}
    </figure>
  );
}

function GalleryRow({
  images,
  directionClass,
  duration,
  cardClassName,
}: {
  images: string[];
  directionClass: (typeof directions)[number];
  duration: string;
  cardClassName: string;
}) {
  const loopImages = [...images, ...images];

  return (
    <div className="sliding-gallery-row group">
      <div
        className={`sliding-gallery-track ${directionClass} group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: duration }}
      >
        {loopImages.map((src, index) => (
          <GalleryImageCard
            key={`${src}-${index}`}
            src={src}
            cardClassName={cardClassName}
            eager={index < 2 || aboveFoldImageSources.has(src)}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomeSlidingGallery() {
  return (
    <section className="section-rhythm-tight overflow-hidden">
      <div key="gallery" className="w-screen overflow-hidden border-y border-[var(--border-default)] bg-[var(--surface-tint)] py-[clamp(1.1rem,2vw,1.9rem)]">
        <div className="space-y-[clamp(0.7rem,1.4vw,1.1rem)] overflow-hidden">
          {galleryRows.map((row, index) => (
            <GalleryRow
              key={`gallery-row-${index}`}
              images={row.images}
              directionClass={directions[index]}
              duration={durations[index]}
              cardClassName={row.cardClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
