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
  const {
    fill: _modalFill,
    width: modalWidth,
    height: modalHeight,
    ...modalImageProps
  } = imageProps;
  const CLOSE_ANIMATION_MS = 260;
  const usesFill = Boolean(imageProps.fill);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const titleId = useId();
  const closeTimerRef = useRef<number | null>(null);
  const pointerStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const TRAVEL_THRESHOLD_PX = 6;

  useEffect(() => {
    setIsClient(true);
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVisible(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMounted]);

  useEffect(() => {
    if (isMounted && !isVisible) {
      closeTimerRef.current = window.setTimeout(() => {
        setIsMounted(false);
      }, CLOSE_ANIMATION_MS);
    }
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isMounted, isVisible]);

  const close = () => setIsVisible(false);
  const open = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsMounted(true);
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  };

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

  const onTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!enableLightbox) return;
    if (event.detail > 0) return;
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

      {isClient && isMounted
        ? createPortal(
        <div
          className={clsx(
            "fixed inset-0 z-[70] flex items-center justify-center px-2 py-2 backdrop-blur-[6px] transition-[background-color,backdrop-filter,opacity] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            isVisible
              ? "bg-[rgba(8,14,20,0.74)] opacity-100"
              : "bg-[rgba(8,14,20,0)] opacity-0"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={close}
        >
          <div
            className={clsx(
              "relative transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              isVisible ? "scale-100 opacity-100" : "scale-[0.93] opacity-0"
            )}
            onClick={stopModalClick}
          >
            <p id={titleId} className="sr-only">
              {alt}
            </p>
            <button
              type="button"
              aria-label="Close image preview"
              onClick={close}
              className="absolute right-3 top-3 z-[3] inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[rgba(12,18,24,0.55)] text-2xl leading-none text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition hover:bg-[rgba(12,18,24,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              &times;
            </button>
            <div className="relative inline-flex overflow-hidden rounded-[24px] border border-white/20 bg-[rgba(10,16,24,0.35)] shadow-[0_30px_84px_rgba(4,10,18,0.52)]">
              <Image
                {...modalImageProps}
                src={src}
                alt={alt}
                width={typeof modalWidth === "number" ? modalWidth : 1600}
                height={typeof modalHeight === "number" ? modalHeight : 1000}
                loading="eager"
                sizes="(max-width: 768px) 94vw, 88vw"
                className="block h-auto max-h-[86vh] w-auto max-w-[94vw] object-contain"
              />
            </div>
          </div>
        </div>,
            document.body
          )
        : null}
    </>
  );
}

