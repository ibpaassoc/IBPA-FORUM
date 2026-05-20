"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import type { ComponentProps, MouseEvent, PointerEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
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
  const usesFill = Boolean(imageProps.fill);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const titleId = useId();
  const pointerStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const TRAVEL_THRESHOLD_PX = 6;

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  const open = () => setIsOpen(true);

  const onTriggerPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!enableLightbox) return;
    if (event.button !== 0) return;
    pointerStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onTriggerPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = pointerStateRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const dx = Math.abs(event.clientX - state.startX);
    const dy = Math.abs(event.clientY - state.startY);
    if (dx > TRAVEL_THRESHOLD_PX || dy > TRAVEL_THRESHOLD_PX) {
      state.moved = true;
    }
  };

  const onTriggerPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const state = pointerStateRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    pointerStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!state.moved) {
      event.preventDefault();
      open();
    }
  };

  const onTriggerPointerCancel = () => {
    pointerStateRef.current = null;
  };

  const onTriggerClick = () => {
    if (!enableLightbox) return;
    // Keyboard activation fallback. Pointer flow is handled by pointer events.
    if (pointerStateRef.current) return;
    open();
  };

  const stopModalClick = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();

  return (
    <>
      <div
        className={clsx(
          "relative block",
          usesFill && "h-full w-full",
          enableLightbox && "cursor-zoom-in",
          !enableLightbox && "cursor-default",
          className
        )}
      >
        <Image {...imageProps} src={src} alt={alt} className={imageClassName} />
        {enableLightbox ? (
          <button
            type="button"
            aria-label={`Open larger image: ${alt}`}
            onPointerDown={onTriggerPointerDown}
            onPointerMove={onTriggerPointerMove}
            onPointerUp={onTriggerPointerUp}
            onPointerCancel={onTriggerPointerCancel}
            onClick={onTriggerClick}
            className="absolute inset-0 z-[2] appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover)] focus-visible:ring-offset-2"
          />
        ) : null}
      </div>

      {isClient && isOpen
        ? createPortal(
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
              &times;
            </button>
            <Image
              {...imageProps}
              src={src}
              alt={alt}
              width={typeof imageProps.width === "number" ? imageProps.width : 1600}
              height={typeof imageProps.height === "number" ? imageProps.height : 1000}
              fill={false}
              loading="eager"
              className="h-auto max-h-[86vh] w-auto max-w-[min(92vw,1200px)] rounded-[var(--radius-lg)] object-contain shadow-[var(--shadow-lg)]"
            />
          </div>
        </div>,
            document.body
          )
        : null}
    </>
  );
}

