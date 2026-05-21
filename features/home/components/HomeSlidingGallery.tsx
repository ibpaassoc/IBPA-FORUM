"use client";

import { ImageContainer } from "@/shared/components/public";

const HorizontalGalleryImages = [
  "/images/gallery/0K9A3130.JPG",
  "/images/gallery/0K9A4883.JPG",
  "/images/gallery/0K9A4722.JPG",
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
  "/images/gallery/DSCF8107.jpg",
  "/images/gallery/DSCF7691.jpg",
  "/images/gallery/DSCF7738.jpg",
  "/images/gallery/DSCF7872.jpg",
  "/images/gallery/DSCF8023.jpg",
  "/images/gallery/DSCF7871.jpg",
];

const VerticalGalleryImages = [
  "/images/gallery/0K9A2667.JPG",
  "/images/gallery/0K9A2829.JPG",
  "/images/gallery/0K9A2843.JPG",
  "/images/gallery/0K9A3107.jpg",
  "/images/gallery/0K9A3233.jpg",
  "/images/gallery/0K9A3366.JPG",
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
          <figure
            key={`${src}-${index}`}
            className={`sliding-gallery-card relative shrink-0 overflow-hidden rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-sm)] ${cardClassName}`}
          >
            <ImageContainer
              src={src}
              alt="IBPA gallery photo"
              fill
              loading="lazy"
              sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, (max-width: 1280px) 384px, 432px"
              className="absolute inset-0"
              imageClassName="object-cover"
            />
          </figure>
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
