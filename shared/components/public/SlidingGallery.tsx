"use client";

import Image from "next/image";

const galleryImages = [
  "/images/gallery/DSCF8122.JPG",
  "/images/gallery/DSCF8120.JPG",
  "/images/gallery/DSCF8107.JPG",
  "/images/gallery/DSCF8101.jpg",
  "/images/gallery/DSCF8093.jpg",
  "/images/gallery/DSCF8075.JPG",
  "/images/gallery/DSCF8073.jpg",
  "/images/gallery/DSCF8071.jpg",
  "/images/gallery/DSCF8050.jpg",
  "/images/gallery/DSCF8034.jpg",
  "/images/gallery/DSCF8023.jpg",
  "/images/gallery/DSCF7963.jpg",
  "/images/gallery/DSCF7956.jpg",
  "/images/gallery/DSCF7877.jpg",
  "/images/gallery/DSCF7872.jpg",
  "/images/gallery/DSCF7871.jpg",
  "/images/gallery/DSCF7841.jpg",
  "/images/gallery/DSCF7772.jpg",
  "/images/gallery/DSCF7738.jpg",
  "/images/gallery/DSCF7731.jpg",
  "/images/gallery/DSCF7693.jpg",
  "/images/gallery/DSCF7691.jpg",
  "/images/gallery/DSCF7663.jpg",
  "/images/gallery/DSCF7662.jpg",
  "/images/gallery/DSC09936.jpg",
  "/images/gallery/DSC09930.jpg",
  "/images/gallery/DSC09924.jpg",
  "/images/gallery/DSC09871.jpg",
  "/images/gallery/DSC09838.jpg",
  "/images/gallery/DSC09827.jpg",
];

const rows = galleryImages.reduce<string[][]>(
  (acc, imagePath, index) => {
    acc[index % 3].push(imagePath);
    return acc;
  },
  [[], [], []],
);

const directions = ["marquee-left", "marquee-right", "marquee-left"] as const;
const durations = ["58s", "64s", "60s"] as const;

function GalleryRow({
  images,
  directionClass,
  duration,
}: {
  images: string[];
  directionClass: (typeof directions)[number];
  duration: string;
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
            className="sliding-gallery-card relative h-[9.6rem] w-[11.5rem] shrink-0 overflow-hidden rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-sm)] sm:h-[11rem] sm:w-[14.75rem] lg:h-[12.2rem] lg:w-[18rem] xl:w-[20.5rem]"
          >
            <Image
              src={src}
              alt="IBPA gallery photo"
              fill
              loading="lazy"
              sizes="(max-width: 640px) 184px, (max-width: 1024px) 236px, (max-width: 1280px) 288px, 328px"
              className="object-cover"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function SlidingGallery() {
  return (
    <section className="section-rhythm-tight overflow-hidden">
      <div className="page-section">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-tint)] py-[clamp(1.1rem,2vw,1.9rem)]">
          <div className="space-y-[clamp(0.7rem,1.4vw,1.1rem)] overflow-hidden">
            {rows.map((row, index) => (
              <GalleryRow
                key={`gallery-row-${index}`}
                images={row}
                directionClass={directions[index]}
                duration={durations[index]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
