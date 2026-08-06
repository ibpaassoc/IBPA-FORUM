"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ImageOff,
  RotateCw,
  Video,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export type FilePreviewAsset = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  source: string | File;
};

type PreviewLocale = "en" | "ru" | "ua";
type LoadStatus = "loading" | "ready" | "error";

const previewCopy = {
  en: {
    close: "Close preview",
    download: "Download",
    next: "Next file",
    previous: "Previous file",
    remove: "Remove",
    open: "Preview",
    document: "Document preview",
    image: "Image",
    loading: "Loading preview",
    failed: "Preview unavailable",
    retry: "Try again",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetZoom: "Reset zoom",
    before: "Before",
    after: "After",
  },
  ru: {
    close: "Закрыть просмотр",
    download: "Скачать",
    next: "Следующий файл",
    previous: "Предыдущий файл",
    remove: "Удалить",
    open: "Открыть просмотр",
    document: "Просмотр документа",
    image: "Изображение",
    loading: "Загрузка превью",
    failed: "Превью недоступно",
    retry: "Повторить",
    zoomIn: "Увеличить",
    zoomOut: "Уменьшить",
    resetZoom: "Сбросить масштаб",
    before: "До",
    after: "После",
  },
  ua: {
    close: "Закрити перегляд",
    download: "Завантажити",
    next: "Наступний файл",
    previous: "Попередній файл",
    remove: "Видалити",
    open: "Відкрити перегляд",
    document: "Перегляд документа",
    image: "Зображення",
    loading: "Завантаження прев'ю",
    failed: "Прев'ю недоступне",
    retry: "Повторити",
    zoomIn: "Збільшити",
    zoomOut: "Зменшити",
    resetZoom: "Скинути масштаб",
    before: "До",
    after: "Після",
  },
} satisfies Record<PreviewLocale, Record<string, string>>;

const MAX_ZOOM = 4;
const MIN_ZOOM = 1;

function isImage(asset: FilePreviewAsset) {
  return asset.mimeType.startsWith("image/") || /\.(avif|gif|heic|heif|jpe?g|png|webp)$/i.test(asset.name);
}

function isPdf(asset: FilePreviewAsset) {
  return asset.mimeType === "application/pdf" || /\.pdf$/i.test(asset.name);
}

/**
 * Never pass one of these mime types to a `<source type>`: the browser filters
 * sources by `canPlayType`, and Chromium answers `""` for `video/quicktime` —
 * the type every uploaded `.mov` is stored with — so it discards the source
 * without fetching a byte. Worse, the resulting `error` fires on the `<source>`
 * element and does not reach the `<video>`, so the player is left blank with
 * nothing to report. Setting `src` on the `<video>` lets it sniff the container
 * (the same `.mov` then decodes fine) and routes failures to `onError`.
 */
function isVideo(asset: FilePreviewAsset) {
  return asset.mimeType.startsWith("video/") || /\.(mp4|mov|webm|og[gv])$/i.test(asset.name);
}

function isMedia(asset: FilePreviewAsset) {
  return isImage(asset) || isVideo(asset);
}

function assetKey(item: FilePreviewAsset) {
  return item.source instanceof File
    ? `${item.id}-${item.source.name}-${item.source.size}-${item.source.lastModified}`
    : `${item.id}-${item.source}`;
}

/**
 * A cached image can finish loading before React attaches `onLoad`, which would
 * strand the thumbnail in its loading state. Catch that on mount instead.
 */
function markSettledImage(node: HTMLImageElement | null, settle: (status: LoadStatus) => void) {
  if (!node || !node.complete) return;
  settle(node.naturalWidth > 0 ? "ready" : "error");
}

/** Cache-busting suffix so a retry actually re-requests a failed asset. */
function withReloadKey(url: string, reloadKey: number) {
  if (reloadKey === 0 || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}__r=${reloadKey}`;
}

/**
 * React key for a media element. It has to carry `reloadKey` separately from the
 * URL: an object URL cannot be cache-busted, so keying on the URL alone would
 * leave a retry with nothing to remount — `status` would sit at "loading"
 * forever, replacing the error tile with an endless skeleton.
 */
function mediaKey(url: string, reloadKey: number) {
  return `${reloadKey}-${url}`;
}

/**
 * Resolve an asset to a displayable URL. Stored assets are already served from
 * an authenticated API path; locally-picked `File`s get an object URL created
 * and revoked inside the same effect so the two can never drift apart.
 */
function useAssetUrl(source: string | File) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof source === "string") return;
    const created = URL.createObjectURL(source);
    // Creating the URL in a lazy useState initializer instead would leave it
    // revoked-but-not-recreated whenever cleanup runs without the initializer
    // re-running — React Strict Mode's dev remount does exactly that, and the
    // result is a broken <img src>.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the object URL's lifetime must match this effect's
    setObjectUrl(created);
    return () => URL.revokeObjectURL(created);
  }, [source]);

  return typeof source === "string" ? source : objectUrl;
}

function AssetUrl({
  asset,
  children,
}: {
  asset: FilePreviewAsset;
  children: (url: string) => ReactNode;
}) {
  const url = useAssetUrl(asset.source);
  if (url === null) return null;
  return <>{children(url)}</>;
}

// ─── Thumbnails ──────────────────────────────────────────────────────────────

function ThumbSkeleton() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(226,240,249,0.75),rgba(255,255,255,0.9),rgba(226,240,249,0.75))]"
    />
  );
}

/**
 * Error overlay for a thumbnail. Sits outside the preview button so the retry
 * control is never a button nested inside another button.
 */
function ThumbError({
  copy,
  onRetry,
}: {
  copy: (typeof previewCopy)[PreviewLocale];
  onRetry: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-white/78 px-3 text-center">
      <ImageOff aria-hidden size={20} className="text-[var(--color-ink-muted)]" />
      <p className="text-[0.66rem] leading-tight text-[var(--color-ink-soft)]">{copy.failed}</p>
      <button
        type="button"
        onClick={onRetry}
        className="pointer-events-auto inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/90 px-3 text-[0.64rem] font-semibold text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]"
      >
        <RotateCw aria-hidden size={12} />
        {copy.retry}
      </button>
    </div>
  );
}

function PreviewThumb({
  item,
  index,
  total,
  url,
  copy,
  caption,
  onOpen,
  onRemove,
}: {
  item: FilePreviewAsset;
  index: number;
  total: number;
  url: string;
  copy: (typeof previewCopy)[PreviewLocale];
  caption?: string;
  onOpen: (image: HTMLImageElement | null) => void;
  onRemove?: () => void;
}) {
  const [status, setStatus] = useState<LoadStatus>(() =>
    isMedia(item) ? "loading" : "ready",
  );
  const [reloadKey, setReloadKey] = useState(0);
  const sourceUrl = withReloadKey(url, reloadKey);
  // Media thumbnails speak for themselves, so they carry no filename. Documents
  // keep theirs — it is the only thing that tells two certificates apart.
  const label = isMedia(item)
    ? `${copy.open}: ${caption ?? copy.image} ${index + 1} / ${total}`
    : `${copy.open}: ${item.name}`;

  function retry() {
    setStatus("loading");
    setReloadKey((current) => current + 1);
  }

  return (
    <li className="group relative min-w-0 overflow-hidden rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white/72 shadow-[0_10px_28px_rgba(55,91,117,0.07)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:shadow-[0_14px_34px_rgba(55,91,117,0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <button
        type="button"
        onClick={(event) => onOpen(event.currentTarget.querySelector("img"))}
        disabled={status === "error"}
        aria-label={label}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[rgba(114,160,193,0.28)] disabled:cursor-not-allowed"
      >
        <span className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[rgba(236,245,251,0.6)]">
          {isImage(item) ? (
            <>
              {status === "loading" ? <ThumbSkeleton /> : null}
              {/* Authenticated API paths and object URLs are dynamic user content
                  and cannot use Next Image's static sizing contract. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={mediaKey(sourceUrl, reloadKey)}
                ref={(node) => markSettledImage(node, setStatus)}
                src={sourceUrl}
                alt=""
                loading="lazy"
                decoding="async"
                onLoad={() => setStatus("ready")}
                onError={() => setStatus("error")}
                className={`size-full object-cover transition duration-300 group-hover:scale-[1.025] motion-reduce:transition-none ${status === "ready" ? "opacity-100" : "opacity-0"}`}
              />
            </>
          ) : isVideo(item) ? (
            <>
              {status === "loading" ? <ThumbSkeleton /> : null}
              <video
                key={mediaKey(sourceUrl, reloadKey)}
                src={sourceUrl}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={() => setStatus("ready")}
                onError={() => setStatus("error")}
                className={`size-full object-cover ${status === "ready" ? "opacity-100" : "opacity-0"}`}
              />
              {status === "ready" ? (
                <span className="absolute flex size-11 items-center justify-center rounded-full bg-white/82 text-[var(--color-blue)] shadow-[0_8px_22px_rgba(55,91,117,0.16)]">
                  <Video aria-hidden size={18} strokeWidth={1.6} />
                </span>
              ) : null}
            </>
          ) : (
            <span className="flex size-12 items-center justify-center rounded-[16px] border border-white/80 bg-white/72 text-[var(--color-blue)] shadow-[0_10px_28px_rgba(55,91,117,0.1)]">
              <FileText aria-hidden size={22} strokeWidth={1.5} />
            </span>
          )}

        </span>

        {caption || !isMedia(item) ? (
          <span className="block border-t border-[rgba(114,160,193,0.14)] px-3 py-2">
            <span className="block truncate text-[0.7rem] font-medium text-[var(--color-ink)]">
              {caption ?? item.name}
            </span>
          </span>
        ) : null}
      </button>

      {status === "error" ? <ThumbError copy={copy} onRetry={retry} /> : null}

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${copy.remove} ${item.name}`}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-white/85 bg-white/88 text-[var(--color-ink-soft)] shadow-[0_7px_20px_rgba(50,80,101,0.16)] backdrop-blur-xl transition hover:bg-white hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]"
        >
          <X aria-hidden size={14} />
        </button>
      ) : null}
    </li>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

function PreviewDialog({
  items,
  initialIndex,
  groupLabel,
  locale,
  onClose,
}: {
  items: FilePreviewAsset[];
  initialIndex: number;
  groupLabel?: string;
  locale: PreviewLocale;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef<{ x: number; y: number; id: number; panX: number; panY: number } | null>(
    null,
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const item = items[index];
  const copy = previewCopy[locale];
  const hasMultiple = items.length > 1;
  const zoomable = item ? isImage(item) : false;

  // Index only ever changes through these two, so resetting the view here keeps
  // every new file starting unzoomed, uncentred, and loading — without an
  // effect that would cascade an extra render on each navigation.
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setReloadKey(0);
    setStatus("loading");
  }, []);
  const goPrevious = useCallback(() => {
    resetView();
    setIndex((current) => (current - 1 + items.length) % items.length);
  }, [items.length, resetView]);
  const goNext = useCallback(() => {
    resetView();
    setIndex((current) => (current + 1) % items.length);
  }, [items.length, resetView]);

  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && hasMultiple) goPrevious();
      if (event.key === "ArrowRight" && hasMultiple) goNext();
      if (!zoomable) return;
      if (event.key === "+" || event.key === "=") {
        setZoom((current) => Math.min(MAX_ZOOM, current + 0.5));
      }
      if (event.key === "-" || event.key === "_") {
        setZoom((current) => {
          const next = Math.max(MIN_ZOOM, current - 0.5);
          if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
          return next;
        });
      }
      if (event.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrevious, hasMultiple, onClose, zoomable]);

  if (!item) return null;

  const zoomed = zoom > 1;

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && !zoomed) return;
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      panX: pan.x,
      panY: pan.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (zoomed) {
      // While zoomed the gesture pans the image instead of paging.
      setPan({ x: start.panX + dx, y: start.panY + dy });
      return;
    }
    setDragOffset({ x: dx, y: Math.max(0, dy) });
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    pointerStart.current = null;
    setIsDragging(false);

    if (zoomed) return;
    setDragOffset({ x: 0, y: 0 });

    if (dy > 88 && Math.abs(dy) > Math.abs(dx) * 1.15) {
      onClose();
      return;
    }
    if (hasMultiple && Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrevious();
    }
  }

  function retry() {
    setStatus("loading");
    setReloadKey((current) => current + 1);
  }

  const title = isMedia(item) ? (groupLabel ?? copy.image) : item.name;

  return createPortal(
    <AssetUrl key={assetKey(item)} asset={item}>
      {(rawUrl) => {
        const url = withReloadKey(rawUrl, reloadKey);
        return (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(75,104,125,0.24)] p-2 backdrop-blur-[12px] sm:items-center sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) onClose();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label={`${copy.open}: ${title}`}
              className="relative flex max-h-[88dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/80 bg-[rgba(248,252,255,0.94)] shadow-[0_30px_90px_rgba(56,91,116,0.24),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-3xl sm:max-h-[86vh]"
              style={{
                transform: `translate3d(${dragOffset.x * 0.18}px, ${dragOffset.y}px, 0)`,
                opacity: dragOffset.y ? Math.max(0.62, 1 - dragOffset.y / 500) : 1,
                transition: isDragging ? "none" : "transform 180ms ease, opacity 180ms ease",
              }}
            >
              <div className="mx-auto mt-2 h-1.5 w-14 shrink-0 rounded-full bg-[#abc2d2]/55 sm:hidden" />

              <header className="flex shrink-0 items-center gap-2 border-b border-[rgba(114,160,193,0.14)] px-3 py-3 sm:px-5 sm:py-4">
                <p className="min-w-0 flex-1 truncate font-[var(--font-title-family)] text-lg font-light text-[var(--color-ink)] sm:text-xl">
                  {title}
                </p>
                {hasMultiple ? (
                  <span className="shrink-0 rounded-full border border-[rgba(114,160,193,0.2)] bg-white/72 px-3 py-1.5 text-xs font-medium text-[var(--color-ink-soft)]">
                    {index + 1} / {items.length}
                  </span>
                ) : null}

                {zoomable ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setZoom((current) => {
                          const next = Math.max(MIN_ZOOM, current - 0.5);
                          if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
                          return next;
                        });
                      }}
                      disabled={zoom <= MIN_ZOOM}
                      aria-label={copy.zoomOut}
                      className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/78 text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
                    >
                      <ZoomOut aria-hidden size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + 0.5))}
                      disabled={zoom >= MAX_ZOOM}
                      aria-label={copy.zoomIn}
                      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/78 text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ZoomIn aria-hidden size={17} />
                    </button>
                  </>
                ) : null}

                <a
                  href={url}
                  download={item.name}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${copy.download} ${item.name}`}
                  className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/78 text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] sm:flex"
                >
                  <Download aria-hidden size={17} />
                </a>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label={copy.close}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/78 text-[var(--color-ink-soft)] transition hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
                >
                  <X aria-hidden size={18} />
                </button>
              </header>

              <div
                className="relative flex min-h-[min(52dvh,520px)] flex-1 touch-none items-center justify-center overflow-hidden bg-[linear-gradient(145deg,rgba(225,240,249,0.58),rgba(255,255,255,0.88))] p-3 sm:min-h-[420px] sm:p-5"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
              >
                {isImage(item) ? (
                  <>
                    {status === "loading" ? (
                      <span
                        aria-hidden
                        className="absolute size-16 animate-pulse rounded-[22px] bg-white/72 shadow-[0_12px_34px_rgba(56,91,116,0.1)]"
                      />
                    ) : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={mediaKey(url, reloadKey)}
                      ref={(node) => markSettledImage(node, setStatus)}
                      src={url}
                      alt={title}
                      draggable={false}
                      loading="eager"
                      fetchPriority="high"
                      onLoad={() => setStatus("ready")}
                      onError={() => setStatus("error")}
                      onDoubleClick={() => {
                        setZoom((current) => (current > 1 ? 1 : 2));
                        setPan({ x: 0, y: 0 });
                      }}
                      style={{
                        transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                        transition: isDragging ? "none" : "transform 200ms ease",
                        cursor: zoomed ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                      }}
                      className={`relative max-h-[calc(88dvh-9.5rem)] max-w-full select-none rounded-[18px] object-contain shadow-[0_18px_55px_rgba(56,91,116,0.13)] sm:max-h-[calc(86vh-8.5rem)] ${status === "ready" ? "opacity-100" : "opacity-0"}`}
                    />
                  </>
                ) : isVideo(item) ? (
                  /* `src`, never a typed <source>: see the note on isVideo. */
                  <video
                    key={mediaKey(url, reloadKey)}
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={() => setStatus("ready")}
                    onError={() => setStatus("error")}
                    className="max-h-[calc(88dvh-9.5rem)] max-w-full rounded-[18px] bg-black shadow-[0_18px_55px_rgba(56,91,116,0.13)] sm:max-h-[calc(86vh-8.5rem)]"
                  />
                ) : isPdf(item) ? (
                  <iframe
                    key={url}
                    src={url}
                    title={`${copy.document}: ${item.name}`}
                    className="h-[min(66dvh,760px)] w-full rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white shadow-[0_18px_55px_rgba(56,91,116,0.1)]"
                  />
                ) : (
                  <div className="flex max-w-md flex-col items-center rounded-[24px] border border-[rgba(114,160,193,0.18)] bg-white/76 px-8 py-10 text-center shadow-[0_18px_55px_rgba(56,91,116,0.08)]">
                    <span className="flex size-16 items-center justify-center rounded-[20px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
                      <FileText aria-hidden size={28} strokeWidth={1.5} />
                    </span>
                    <p className="mt-4 max-w-full truncate text-sm font-medium text-[var(--color-ink)]">
                      {item.name}
                    </p>
                    <a
                      href={url}
                      download={item.name}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(86,139,177,0.24)]"
                    >
                      <Download aria-hidden size={16} />
                      {copy.download}
                    </a>
                  </div>
                )}

                {status === "error" && isMedia(item) ? (
                  <div className="absolute flex flex-col items-center gap-3 rounded-[22px] border border-[rgba(114,160,193,0.18)] bg-white/86 px-7 py-6 text-center">
                    <ImageOff aria-hidden size={26} className="text-[var(--color-ink-muted)]" />
                    <p className="text-sm text-[var(--color-ink-soft)]">{copy.failed}</p>
                    <button
                      type="button"
                      onClick={retry}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/86 px-4 text-[0.72rem] font-semibold text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]"
                    >
                      <RotateCw aria-hidden size={14} />
                      {copy.retry}
                    </button>
                  </div>
                ) : null}

                {hasMultiple ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrevious}
                      aria-label={copy.previous}
                      className="absolute left-5 hidden size-12 items-center justify-center rounded-full border border-white/85 bg-white/82 text-[var(--color-blue)] shadow-[0_12px_34px_rgba(56,91,116,0.16)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)] motion-reduce:transition-none sm:flex"
                    >
                      <ChevronLeft aria-hidden size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label={copy.next}
                      className="absolute right-5 hidden size-12 items-center justify-center rounded-full border border-white/85 bg-white/82 text-[var(--color-blue)] shadow-[0_12px_34px_rgba(56,91,116,0.16)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)] motion-reduce:transition-none sm:flex"
                    >
                      <ChevronRight aria-hidden size={22} />
                    </button>
                  </>
                ) : null}
              </div>

              <footer className="flex shrink-0 items-center justify-center gap-3 border-t border-[rgba(114,160,193,0.12)] px-4 py-3 sm:hidden">
                {hasMultiple ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrevious}
                      aria-label={copy.previous}
                      className="flex size-11 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/80 text-[var(--color-blue)]"
                    >
                      <ChevronLeft aria-hidden size={18} />
                    </button>
                    <span className="min-w-16 text-center text-xs font-medium text-[var(--color-ink-soft)]">
                      {index + 1} / {items.length}
                    </span>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label={copy.next}
                      className="flex size-11 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/80 text-[var(--color-blue)]"
                    >
                      <ChevronRight aria-hidden size={18} />
                    </button>
                  </>
                ) : null}
                <a
                  href={url}
                  download={item.name}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={copy.download}
                  className="ml-auto flex size-11 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/80 text-[var(--color-blue)]"
                >
                  <Download aria-hidden size={17} />
                </a>
              </footer>
            </section>
          </div>
        );
      }}
    </AssetUrl>,
    document.body,
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export default function FilePreviewGallery({
  items,
  onRemove,
  isRemovable,
  locale,
  className,
  columns = "responsive",
  pairing,
  groupLabel,
}: {
  items: FilePreviewAsset[];
  onRemove?: (id: string) => void;
  isRemovable?: (id: string) => boolean;
  locale?: PreviewLocale;
  className?: string;
  columns?: "responsive" | "compact" | "single";
  /** Renders the list as ordered before/after couples, preserving upload order. */
  pairing?: "before-after";
  /** Human name for the set, shown in the lightbox instead of a raw filename. */
  groupLabel?: string;
}) {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const activeLocale = locale ?? language;
  const copy = previewCopy[activeLocale];

  const openFilePreview = useCallback(async (index: number, image: HTMLImageElement | null) => {
    // Give an in-flight thumbnail a moment to decode so the lightbox opens on a
    // painted image rather than an empty frame.
    if (image && !image.complete) {
      await Promise.race([
        image.decode().catch(() => undefined),
        new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
      ]);
    }
    setOpenIndex(index);
  }, []);

  if (!items.length) return null;

  const columnsClass =
    columns === "single"
      ? "grid-cols-1"
      : columns === "compact"
        ? "grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4";

  function renderThumb(item: FilePreviewAsset, index: number, caption?: string) {
    return (
      <AssetUrl key={assetKey(item)} asset={item}>
        {(url) => (
          <PreviewThumb
            item={item}
            index={index}
            total={items.length}
            url={url}
            copy={copy}
            caption={caption}
            onOpen={(image) => void openFilePreview(index, image)}
            onRemove={
              onRemove && (isRemovable?.(item.id) ?? true) ? () => onRemove(item.id) : undefined
            }
          />
        )}
      </AssetUrl>
    );
  }

  return (
    <>
      {pairing === "before-after" ? (
        <div className={`grid gap-3 sm:grid-cols-2 ${className ?? ""}`}>
          {Array.from({ length: Math.ceil(items.length / 2) }, (_, pairIndex) => {
            const first = items[pairIndex * 2];
            const second = items[pairIndex * 2 + 1];
            return (
              <ul
                key={assetKey(first)}
                className="grid grid-cols-2 gap-2 rounded-[22px] border border-[rgba(114,160,193,0.16)] bg-white/54 p-2"
              >
                {renderThumb(first, pairIndex * 2, copy.before)}
                {second ? renderThumb(second, pairIndex * 2 + 1, copy.after) : null}
              </ul>
            );
          })}
        </div>
      ) : (
        <ul className={`grid gap-2.5 ${columnsClass} ${className ?? ""}`}>
          {items.map((item, index) => renderThumb(item, index))}
        </ul>
      )}

      {openIndex !== null && items[openIndex] ? (
        <PreviewDialog
          items={items}
          initialIndex={openIndex}
          groupLabel={groupLabel}
          locale={activeLocale}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </>
  );
}
