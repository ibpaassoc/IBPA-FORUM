"use client";

import EditorialMasonryGallery from "@/shared/components/media/EditorialMasonryGallery";

export default function HomeEventGallery() {
  return (
    <EditorialMasonryGallery
      label="Editorial Gallery"
      title="Real event photography, not placeholders"
      text="A rotating mix of nominations, backstage moments, judging, and community scenes helps the platform feel rooted in the live IBPA world."
      items={[
        {
          src: "/images/events/DSC00060.jpg",
          alt: "IBPA event atmosphere with a red-carpet presentation",
          title: "Nominations night energy",
          eyebrow: "Ceremony",
          text: "A cinematic stage and crowd moment that brings the event presence forward.",
          aspectClassName: "aspect-[4/5]",
          objectPosition: "center 30%",
          sizes: "(max-width: 768px) 100vw, 40vw",
          preload: false,
        },
        {
          src: "/images/community/DSC00365.jpg",
          alt: "Beauty professionals networking at an IBPA gathering",
          title: "Community and connection",
          eyebrow: "Networking",
          text: "Real professional relationships, collaboration, and visibility across the membership base.",
          aspectClassName: "aspect-[4/5]",
          objectPosition: "center 25%",
          sizes: "(max-width: 768px) 100vw, 33vw",
        },
        {
          src: "/images/events/DSC00272.jpg",
          alt: "Live judging and conference atmosphere at IBPA",
          title: "Behind the scenes",
          eyebrow: "Judging",
          text: "Live event coverage makes the championship experience feel grounded and editorial.",
          aspectClassName: "aspect-[16/10]",
          objectPosition: "center 24%",
          sizes: "(max-width: 768px) 100vw, 33vw",
        },
        {
          src: "/images/community/funny.jpg",
          alt: "Warm community moment from an IBPA gathering",
          title: "Human side of IBPA",
          eyebrow: "Community",
          text: "A softer, more personal moment that keeps the brand approachable and alive.",
          aspectClassName: "aspect-[4/5]",
          objectPosition: "center 18%",
          sizes: "(max-width: 768px) 100vw, 33vw",
        },
        {
          src: "/images/events/DSC00173.jpg",
          alt: "Event recap moment from the IBPA competition floor",
          title: "Recap scenes",
          eyebrow: "Highlights",
          text: "A dynamic photo that carries the momentum of the full championship experience.",
          aspectClassName: "aspect-[16/11]",
          objectPosition: "center 32%",
          sizes: "(max-width: 768px) 100vw, 33vw",
        },
        {
          src: "/images/community/DSC09818.jpg",
          alt: "Registration and support area at an IBPA event",
          title: "Professional organization",
          eyebrow: "Check-in",
          text: "The operational side of the event still feels polished and premium.",
          aspectClassName: "aspect-[4/5]",
          objectPosition: "center 28%",
          sizes: "(max-width: 768px) 100vw, 33vw",
        },
      ]}
    />
  );
}
