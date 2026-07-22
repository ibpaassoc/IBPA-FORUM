"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ImageIcon,
  X,
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

const previewCopy = {
  en: {
    close: "Close preview",
    download: "Download",
    next: "Next file",
    previous: "Previous file",
    remove: "Remove",
    open: "Preview",
    document: "Document preview",
  },
  ru: {
    close: "Закрыть просмотр",
    download: "Скачать",
    next: "Следующий файл",
    previous: "Предыдущий файл",
    remove: "Удалить",
    open: "Открыть просмотр",
    document: "Просмотр документа",
  },
  ua: {
    close: "Закрити перегляд",
    download: "Завантажити",
    next: "Наступний файл",
    previous: "Попередній файл",
    remove: "Видалити",
    open: "Відкрити перегляд",
    document: "Перегляд документа",
  },
} satisfies Record<PreviewLocale, Record<string, string>>;

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function isImage(asset: FilePreviewAsset) {
  return asset.mimeType.startsWith("image/") || /\.(avif|gif|heic|heif|jpe?g|png|webp)$/i.test(asset.name);
}

function isPdf(asset: FilePreviewAsset) {
  return asset.mimeType === "application/pdf" || /\.pdf$/i.test(asset.name);
}

function assetKey(item: FilePreviewAsset) {
  return item.source instanceof File
    ? `${item.id}-${item.source.name}-${item.source.size}-${item.source.lastModified}`
    : `${item.id}-${item.source}`;
}

function AssetUrl({ asset, children }: { asset: FilePreviewAsset; children: (url: string) => ReactNode }) {
  const [url] = useState(() =>
    typeof asset.source === "string" ? asset.source : URL.createObjectURL(asset.source),
  );

  useEffect(() => {
    if (typeof asset.source === "string") return;
    return () => URL.revokeObjectURL(url);
  }, [asset.source, url]);

  return children(url);
}

function PreviewAssetUrl({
  asset,
  preferredUrl,
  children,
}: {
  asset: FilePreviewAsset;
  preferredUrl?: string;
  children: (url: string) => ReactNode;
}) {
  if (preferredUrl) return children(preferredUrl);
  return <AssetUrl asset={asset}>{children}</AssetUrl>;
}

function PreviewDialog({
  items,
  initialIndex,
  initialUrl,
  locale,
  onClose,
}: {
  items: FilePreviewAsset[];
  initialIndex: number;
  initialUrl: string;
  locale: PreviewLocale;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const item = items[index];
  const copy = previewCopy[locale];
  const hasMultiple = items.length > 1;

  const goPrevious = useCallback(() => {
    setIndex((current) => (current - 1 + items.length) % items.length);
  }, [items.length]);
  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMultiple) goPrevious();
      if (event.key === "ArrowRight" && hasMultiple) goNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [goNext, goPrevious, hasMultiple, onClose]);

  if (!item) return null;

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    pointerStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    setDragOffset({ x: event.clientX - start.x, y: Math.max(0, event.clientY - start.y) });
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    pointerStart.current = null;
    setIsDragging(false);
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

  return createPortal(
    <PreviewAssetUrl
      key={assetKey(item)}
      asset={item}
      preferredUrl={index === initialIndex ? initialUrl : undefined}
    >
      {(url) => <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(75,104,125,0.24)] p-2 backdrop-blur-[12px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${copy.open}: ${item.name}`}
        className="relative flex max-h-[88dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[rgba(248,252,255,0.92)] shadow-[0_30px_90px_rgba(56,91,116,0.24),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-3xl sm:max-h-[86vh] sm:rounded-[34px]"
        style={{
          transform: `translate3d(${dragOffset.x * 0.18}px, ${dragOffset.y}px, 0)`,
          opacity: dragOffset.y ? Math.max(0.62, 1 - dragOffset.y / 500) : 1,
          transition: isDragging ? "none" : "transform 180ms ease, opacity 180ms ease",
        }}
      >
        <div className="mx-auto mt-2 h-1.5 w-14 shrink-0 rounded-full bg-[#abc2d2]/55 sm:hidden" />
        <header className="flex shrink-0 items-center gap-3 border-b border-[rgba(114,160,193,0.14)] px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-[var(--font-title-family)] text-lg font-light text-[var(--color-ink)] sm:text-xl">
              {item.name}
            </p>
            <p className="mt-0.5 text-[0.68rem] text-[var(--color-ink-soft)]">
              {formatFileSize(item.size)}
            </p>
          </div>
          {hasMultiple ? (
            <span className="shrink-0 rounded-full border border-[rgba(114,160,193,0.2)] bg-white/72 px-3 py-1.5 text-xs font-medium text-[var(--color-ink-soft)]">
              {index + 1} / {items.length}
            </span>
          ) : null}
          <a
            href={url}
            download={item.name}
            target="_blank"
            rel="noreferrer"
            aria-label={`${copy.download} ${item.name}`}
            className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/78 text-[var(--color-blue)] shadow-[0_8px_22px_rgba(54,94,123,0.08)] transition hover:bg-[var(--color-blue-wash)] sm:flex"
          >
            <Download aria-hidden size={17} />
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/78 text-[var(--color-ink-soft)] shadow-[0_8px_22px_rgba(54,94,123,0.08)] transition hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
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
              <span className="absolute flex size-16 items-center justify-center rounded-[22px] bg-white/72 text-[var(--color-blue)] shadow-[0_12px_34px_rgba(56,91,116,0.1)]">
                <ImageIcon aria-hidden size={28} strokeWidth={1.4} />
              </span>
              {/* Blob/object URLs are dynamic user content and cannot use Next Image's static sizing contract. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={url}
                src={url}
                alt={item.name}
                draggable={false}
                loading="eager"
                fetchPriority="high"
                className="relative max-h-[calc(88dvh-9.5rem)] max-w-full select-none rounded-[22px] object-contain shadow-[0_18px_55px_rgba(56,91,116,0.13)] sm:max-h-[calc(86vh-8.5rem)]"
              />
            </>
          ) : isPdf(item) ? (
            <iframe
              key={url}
              src={url}
              title={`${copy.document}: ${item.name}`}
              className="h-[min(66dvh,760px)] w-full rounded-[20px] border border-[rgba(114,160,193,0.18)] bg-white shadow-[0_18px_55px_rgba(56,91,116,0.1)]"
            />
          ) : (
            <div className="flex max-w-md flex-col items-center rounded-[26px] border border-[rgba(114,160,193,0.18)] bg-white/76 px-8 py-10 text-center shadow-[0_18px_55px_rgba(56,91,116,0.08)]">
              <span className="flex size-16 items-center justify-center rounded-[22px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
                <FileText aria-hidden size={28} strokeWidth={1.5} />
              </span>
              <p className="mt-4 max-w-full truncate text-sm font-medium text-[var(--color-ink)]">{item.name}</p>
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

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={goPrevious}
                aria-label={copy.previous}
                className="absolute left-7 hidden size-12 items-center justify-center rounded-full border border-white/85 bg-white/82 text-[var(--color-blue)] shadow-[0_12px_34px_rgba(56,91,116,0.16)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white sm:flex"
              >
                <ChevronLeft aria-hidden size={22} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={copy.next}
                className="absolute right-7 hidden size-12 items-center justify-center rounded-full border border-white/85 bg-white/82 text-[var(--color-blue)] shadow-[0_12px_34px_rgba(56,91,116,0.16)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white sm:flex"
              >
                <ChevronRight aria-hidden size={22} />
              </button>
            </>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-center gap-3 border-t border-[rgba(114,160,193,0.12)] px-4 py-3 sm:hidden">
          {hasMultiple ? (
            <>
              <button type="button" onClick={goPrevious} aria-label={copy.previous} className="flex size-10 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/80 text-[var(--color-blue)]">
                <ChevronLeft aria-hidden size={18} />
              </button>
              <span className="min-w-16 text-center text-xs font-medium text-[var(--color-ink-soft)]">{index + 1} / {items.length}</span>
              <button type="button" onClick={goNext} aria-label={copy.next} className="flex size-10 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/80 text-[var(--color-blue)]">
                <ChevronRight aria-hidden size={18} />
              </button>
            </>
          ) : null}
          <a href={url} download={item.name} target="_blank" rel="noreferrer" className="ml-auto flex min-h-10 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/80 px-4 text-xs font-semibold text-[var(--color-blue)]">
            <Download aria-hidden size={15} />
            {copy.download}
          </a>
        </footer>
      </section>
    </div>}
    </PreviewAssetUrl>,
    document.body,
  );
}

export default function FilePreviewGallery({
  items,
  onRemove,
  isRemovable,
  locale,
  className,
  columns = "responsive",
}: {
  items: FilePreviewAsset[];
  onRemove?: (id: string) => void;
  isRemovable?: (id: string) => boolean;
  locale?: PreviewLocale;
  className?: string;
  columns?: "responsive" | "compact" | "single";
}) {
  const { language } = useLanguage();
  const [openPreview, setOpenPreview] = useState<{ index: number; url: string } | null>(null);
  const activeLocale = locale ?? language;
  const copy = previewCopy[activeLocale];

  async function openFilePreview(index: number, url: string, image: HTMLImageElement | null) {
    if (image && !image.complete) {
      await Promise.race([
        image.decode().catch(() => undefined),
        new Promise<void>((resolve) => window.setTimeout(resolve, 1800)),
      ]);
    }
    setOpenPreview({ index, url });
  }

  if (!items.length) return null;

  const columnsClass =
    columns === "single"
      ? "grid-cols-1"
      : columns === "compact"
        ? "grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4";

  return (
    <>
      <ul className={`grid gap-2.5 ${columnsClass} ${className ?? ""}`}>
        {items.map((item, index) => {
          const tone = index % 3;
          const toneClass =
            tone === 0
              ? "bg-[linear-gradient(145deg,rgba(244,250,254,0.96),rgba(218,237,248,0.58))]"
              : tone === 1
                ? "bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(231,242,249,0.66))]"
                : "bg-[linear-gradient(145deg,rgba(236,247,252,0.9),rgba(255,255,255,0.78))]";
          return (
            <AssetUrl key={assetKey(item)} asset={item}>
              {(url) => <li
              className={`group relative min-w-0 overflow-hidden rounded-[20px] border border-white/80 ${toneClass} shadow-[0_12px_32px_rgba(55,91,117,0.09),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(55,91,117,0.14)]`}
            >
              <button
                type="button"
                onClick={(event) => {
                  void openFilePreview(index, url, event.currentTarget.querySelector("img"));
                }}
                aria-label={`${copy.open}: ${item.name}`}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[rgba(114,160,193,0.25)]"
              >
                <span className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-white/48">
                  {isImage(item) ? (
                    // Dynamic previews include object URLs and authenticated API paths.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="size-full object-cover transition duration-300 group-hover:scale-[1.025]" />
                  ) : (
                    <span className="flex size-14 items-center justify-center rounded-[20px] border border-white/80 bg-white/72 text-[var(--color-blue)] shadow-[0_10px_28px_rgba(55,91,117,0.1)]">
                      {isPdf(item) ? <FileText aria-hidden size={24} strokeWidth={1.5} /> : <ImageIcon aria-hidden size={24} strokeWidth={1.5} />}
                    </span>
                  )}
                </span>
                <span className="block border-t border-white/65 px-3 py-2.5">
                  <span className="block truncate text-xs font-medium text-[var(--color-ink)]">{item.name}</span>
                  <span className="mt-1 block text-[0.66rem] text-[var(--color-ink-soft)]">{formatFileSize(item.size)}</span>
                </span>
              </button>

              {onRemove && (isRemovable?.(item.id) ?? true) ? (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`${copy.remove} ${item.name}`}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border border-white/85 bg-white/86 text-[var(--color-ink-soft)] shadow-[0_7px_20px_rgba(50,80,101,0.16)] backdrop-blur-xl transition hover:bg-white hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]"
                >
                  <X aria-hidden size={13} />
                </button>
              ) : null}
            </li>}
            </AssetUrl>
          );
        })}
      </ul>

      {openPreview && items[openPreview.index] ? (
        <PreviewDialog
          items={items}
          initialIndex={openPreview.index}
          initialUrl={openPreview.url}
          locale={activeLocale}
          onClose={() => setOpenPreview(null)}
        />
      ) : null}
    </>
  );
}
