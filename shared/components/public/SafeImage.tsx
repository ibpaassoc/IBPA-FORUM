"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type SafeImageProps = {
  src?: string | null;
  fallbackSrc?: string | null;
  fallbackSrcs?: Array<string | null | undefined>;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  unoptimized?: boolean;
  objectPosition?: string;
  mobileObjectPosition?: string;
};

export default function SafeImage({
  src,
  fallbackSrc,
  fallbackSrcs,
  alt,
  fill = true,
  sizes,
  priority,
  className,
  unoptimized,
  objectPosition,
  mobileObjectPosition,
}: SafeImageProps) {
  const normalizedSources = useMemo(() => {
    const candidates = [src, fallbackSrc, ...(fallbackSrcs ?? [])];
    const deduped = new Set<string>();

    for (const candidate of candidates) {
      if (!candidate) continue;
      const normalized = candidate.trim();
      if (!normalized) continue;
      deduped.add(normalized);
    }

    return Array.from(deduped);
  }, [src, fallbackSrc, fallbackSrcs]);

  const sourceSignature = normalizedSources.join("|");
  const [sourceState, setSourceState] = useState(() => ({
    signature: sourceSignature,
    index: 0,
  }));

  const activeSourceIndex = sourceState.signature === sourceSignature ? sourceState.index : 0;

  const activeSrc = normalizedSources[activeSourceIndex] ?? null;
  const showFallback = !activeSrc;
  const imageStyle = {
    "--safe-image-desktop-position": objectPosition ?? "center",
    "--safe-image-mobile-position": mobileObjectPosition ?? objectPosition ?? "center",
  } as CSSProperties;

  return (
    <>
      {!showFallback ? (
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          fill={fill}
          sizes={sizes}
          priority={priority}
          onError={() =>
            setSourceState((current) => {
              if (current.signature !== sourceSignature) {
                return { signature: sourceSignature, index: 1 };
              }

              return { signature: current.signature, index: current.index + 1 };
            })
          }
          className={clsx("safe-image-asset", className)}
          unoptimized={unoptimized}
          style={imageStyle}
        />
      ) : null}
      <div
        className={clsx(
          "absolute inset-0 flex items-center justify-center bg-[linear-gradient(155deg,#f5f9fc_0%,#e7eff6_100%)] text-[var(--color-ink-muted)] transition-opacity duration-200",
          showFallback ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!showFallback}
      >
        <div className="flex flex-col items-center gap-2">
          <ImageOff size={22} strokeWidth={1.8} />
          <span className="text-[0.68rem] uppercase tracking-[0.16em]">Image unavailable</span>
        </div>
      </div>
    </>
  );
}
