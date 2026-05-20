"use client";

import Image from "next/image";
import type { ComponentProps, MouseEvent } from "react";
import { useEffect, useId, useState } from "react";
import clsx from "clsx";

type ImageContainerProps = Omit<ComponentProps<typeof Image>, "className"> & {
  className?: string;
  imageClassName?: string;
  enableLightbox?: boolean;
};

export default function ImageContainer({
  src,
  alt,
  className,
  imageClassName,
  enableLightbox = true,
  ...imageProps
}: ImageContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);
  const open = () => {
    if (!enableLightbox) return;
    setIsOpen(true);
  };

  const stopModalClick = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={!enableLightbox}
        aria-label={enableLightbox ? `Open larger image: ${alt}` : undefined}
        className={clsx(
          "relative block w-full text-left transition duration-300",
          enableLightbox && "cursor-zoom-in hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover)] focus-visible:ring-offset-2",
          !enableLightbox && "cursor-default",
          className
        )}
      >
        <Image {...imageProps} src={src} alt={alt} className={imageClassName} />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,14,20,0.72)] px-4 py-6 backdrop-blur-[4px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={close}
        >
          <div className="relative max-w-[min(92vw,1200px)]" onClick={stopModalClick}>
            <p id={titleId} className="sr-only">
              {alt}
            </p>
            <button
              type="button"
              aria-label="Close image preview"
              onClick={close}
              className="absolute right-2 top-2 z-[1] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[rgba(10,15,20,0.58)] text-2xl leading-none text-white shadow-[var(--shadow-sm)] transition hover:bg-[rgba(10,15,20,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              ×
            </button>
            <Image
              {...imageProps}
              src={src}
              alt={alt}
              width={typeof imageProps.width === "number" ? imageProps.width : 1600}
              height={typeof imageProps.height === "number" ? imageProps.height : 1000}
              fill={false}
              priority
              className="h-auto max-h-[86vh] w-auto max-w-[min(92vw,1200px)] rounded-[var(--radius-lg)] object-contain shadow-[var(--shadow-lg)]"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
