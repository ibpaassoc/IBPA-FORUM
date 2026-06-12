"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import type { ComponentProps, MouseEvent, PointerEvent, SyntheticEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";

type ImageContainerProps = Omit<ComponentProps<typeof Image>, "className"> & {
  className?: string;
  imageClassName?: string;
  enableLightbox?: boolean;
};

function resolveImageSource(src: ComponentProps<typeof Image>["src"]) {
  if (typeof src === "string") return src;
  if (src && typeof src === "object" && "src" in src && typeof src.src === "string") {
    return src.src;
  }
  return null;
}

export default function ImageContainer({
  src,
  alt,
  className,
  imageClassName,
  enableLightbox = true,
  ...imageProps
}: ImageContainerProps) {
  const {
    width: modalWidth,
    height: modalHeight,
    ...rawModalImageProps
  } = imageProps;
  const modalImageProps = { ...rawModalImageProps } as Omit<
    ComponentProps<typeof Image>,
    "className"
  >;
  if ("fill" in modalImageProps) {
    delete (modalImageProps as { fill?: boolean }).fill;
  }
  const {
    onLoad: modalOnLoad,
    onError: modalOnError,
    ...modalImagePropsWithoutHandlers
  } = modalImageProps;
  const CLOSE_ANIMATION_MS = 260;
  const usesFill = Boolean(imageProps.fill);
  const resolvedModalSrc = resolveImageSource(src) ?? "__unknown__";
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);
  const [didModalImageFail, setDidModalImageFail] = useState(false);
  const [modalImageStateSrc, setModalImageStateSrc] = useState(resolvedModalSrc);
  const titleId = useId();
  const closeTimerRef = useRef<number | null>(null);
  const preloadedImageSetRef = useRef<Set<string>>(new Set());
  const pointerStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const TRAVEL_THRESHOLD_PX = 6;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isModalMounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalMounted]);

  useEffect(() => {
    if (isModalMounted && !isModalOpen) {
      closeTimerRef.current = window.setTimeout(() => {
        setIsModalMounted(false);
      }, CLOSE_ANIMATION_MS);
    }
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isModalMounted, isModalOpen]);

  const preloadModalImage = () => {
    if (typeof window === "undefined") return;
    if (!resolvedModalSrc || resolvedModalSrc === "__unknown__") return;
    if (preloadedImageSetRef.current.has(resolvedModalSrc)) return;
    const preloadImg = new window.Image();
    preloadImg.decoding = "async";
    preloadImg.src = resolvedModalSrc;
    preloadedImageSetRef.current.add(resolvedModalSrc);
  };

  const close = () => setIsModalOpen(false);
  const open = () => {
    preloadModalImage();
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsModalImageLoaded(false);
    setDidModalImageFail(false);
    setModalImageStateSrc(resolvedModalSrc);
    setIsModalMounted(true);
    requestAnimationFrame(() => {
      setIsModalOpen(true);
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
    preloadModalImage();
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
  const handleModalImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setModalImageStateSrc(resolvedModalSrc);
    setIsModalImageLoaded(true);
    setDidModalImageFail(false);
    modalOnLoad?.(event);
  };
  const handleModalImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    setModalImageStateSrc(resolvedModalSrc);
    setIsModalImageLoaded(false);
    setDidModalImageFail(true);
    modalOnError?.(event);
  };
  const hasStatusForCurrentSource = modalImageStateSrc === resolvedModalSrc;
  const showModalError = hasStatusForCurrentSource && didModalImageFail;
  const showModalImage = hasStatusForCurrentSource && isModalImageLoaded && !didModalImageFail;
  const showModalLoading = !showModalImage && !showModalError;
  const canUseDOM = typeof document !== "undefined";
  const modalAspectRatio =
    typeof modalWidth === "number" && typeof modalHeight === "number"
      ? `${modalWidth} / ${modalHeight}`
      : "16 / 10";

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
            className="absolute inset-0 z-[2] appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hover-accent)] focus-visible:ring-offset-2"
          />
        ) : null}
      </div>

      {canUseDOM && isModalMounted
        ? createPortal(
        <div
          className={clsx(
            "fixed inset-0 z-[70] flex items-center justify-center px-2 py-2 backdrop-blur-[6px] transition-[background-color,backdrop-filter,opacity] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            isModalOpen
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
              isModalOpen ? "scale-100 opacity-100" : "scale-[0.93] opacity-0"
            )}
            onClick={stopModalClick}
          >
            <p id={titleId} className="sr-only">
              {alt}
            </p>
            <div
              className="relative w-[min(92vw,1180px)] max-h-[82vh] overflow-hidden rounded-[24px] border border-white/20 bg-[rgba(10,16,24,0.35)] shadow-[0_30px_84px_rgba(4,10,18,0.52)]"
              style={{ aspectRatio: modalAspectRatio }}
            >
              <button
                type="button"
                aria-label="Close image preview"
                onClick={close}
                className="absolute right-3 top-3 z-[4] inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[rgba(12,18,24,0.55)] text-2xl leading-none text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition hover:bg-[rgba(12,18,24,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                &times;
              </button>
              {showModalLoading ? (
                <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[linear-gradient(155deg,rgba(22,31,40,0.64)_0%,rgba(14,22,30,0.82)_100%)]">
                  <span
                    className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                </div>
              ) : null}
              {showModalError ? (
                <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[rgba(14,22,30,0.86)] px-6">
                  <span className="rounded-full border border-white/20 bg-[rgba(255,255,255,0.08)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.17em] text-white/85">
                    Image unavailable
                  </span>
                </div>
              ) : null}
              <Image
                {...modalImagePropsWithoutHandlers}
                src={src}
                alt={alt}
                fill
                loading="eager"
                quality={75}
                sizes="(max-width: 768px) 92vw, 88vw"
                onLoad={handleModalImageLoad}
                onError={handleModalImageError}
                className={clsx(
                  "object-contain transition-opacity duration-300",
                  showModalImage ? "opacity-100" : "opacity-0"
                )}
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

