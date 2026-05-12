"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

type SafeImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  unoptimized?: boolean;
};

export default function SafeImage({
  src,
  alt,
  fill = true,
  sizes,
  priority,
  className,
  unoptimized,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const validSrc = useMemo(() => (src && src.trim().length > 0 ? src : null), [src]);
  const showFallback = failed || !validSrc;

  return (
    <>
      {!showFallback ? (
        <Image
          src={validSrc}
          alt={alt}
          fill={fill}
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={className}
          unoptimized={unoptimized}
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
