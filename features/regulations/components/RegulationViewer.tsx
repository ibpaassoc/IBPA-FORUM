"use client";

import { AlertCircle, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type RegulationViewerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  src: string;
  copy: {
    close: string;
    loading: string;
    error: string;
  };
};

type ViewerState = "loading" | "ready" | "error";

export default function RegulationViewer({
  open,
  onClose,
  title,
  src,
  copy,
}: RegulationViewerProps) {
  const [state, setState] = useState<ViewerState>("loading");

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    void fetch(src, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("PDF unavailable");
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
      });

    return () => controller.abort();
  }, [open, src]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(14,24,33,0.56)] p-2 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="regulation-viewer-title"
        className="flex h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[26px] border border-white/65 bg-white/88 shadow-[0_40px_120px_rgba(8,20,29,0.3)] backdrop-blur-2xl sm:h-[90dvh] sm:rounded-[34px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[rgba(114,160,193,0.18)] bg-white/78 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
              PDF
            </p>
            <h2
              id="regulation-viewer-title"
              className="truncate font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)] sm:text-2xl"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.24)] bg-white/84 text-[var(--color-ink-soft)] shadow-[0_8px_22px_rgba(37,42,45,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
          >
            <X aria-hidden size={18} />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 bg-[#e9eef1]">
          {state === "loading" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/82 text-[var(--color-ink-soft)]">
              <LoaderCircle aria-hidden size={28} className="animate-spin text-[var(--color-blue)]" />
              <p className="text-sm">{copy.loading}</p>
            </div>
          ) : null}

          {state === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/86 px-6 text-center">
              <AlertCircle aria-hidden size={30} className="text-red-500" />
              <p className="max-w-md text-sm leading-6 text-red-700">{copy.error}</p>
            </div>
          ) : null}

          {state === "ready" ? (
            <iframe
              src={src}
              title={title}
              className="h-full w-full border-0 bg-white"
              onError={() => setState("error")}
            />
          ) : null}
        </div>
      </section>
    </div>,
    document.body,
  );
}
