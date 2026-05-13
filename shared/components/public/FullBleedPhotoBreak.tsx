"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import FadeUp from "./FadeUp";

type FullBleedPhotoBreakProps = {
  src: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
  priority?: boolean;
  objectPosition?: string;
  mobileObjectPosition?: string;
};

export default function FullBleedPhotoBreak({
  src,
  alt,
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
  priority,
  objectPosition,
  mobileObjectPosition,
}: FullBleedPhotoBreakProps) {
  const imageStyle = {
    "--full-bleed-desktop-position": objectPosition ?? "center",
    "--full-bleed-mobile-position": mobileObjectPosition ?? objectPosition ?? "center",
  } as CSSProperties;

  return (
    <section
      className={clsx(
        "relative isolate my-[var(--space-2xl)] min-h-[52vh] overflow-hidden border-y border-[var(--border-default)]",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="full-bleed-image object-cover"
        sizes="100vw"
        style={imageStyle}
      />
      <div className="absolute inset-0 bg-[rgba(15,23,32,0.22)]" />
      <div className="page-section relative z-10 flex min-h-[52vh] items-end py-[var(--space-xl)]">
        <FadeUp className={clsx("max-w-3xl text-white", align === "center" && "mx-auto text-center")}>
          {eyebrow ? (
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--color-blue-soft)]">{eyebrow}</p>
          ) : null}
          {title ? (
            <h2 className="mt-[var(--space-xs)] text-[clamp(2rem,4.2vw,4rem)] leading-[1.05] text-white">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-[var(--space-sm)] max-w-2xl text-[clamp(0.95rem,1.6vw,1.08rem)] leading-[1.8] text-white/92">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-[var(--space-md)]">{children}</div> : null}
        </FadeUp>
      </div>
    </section>
  );
}
