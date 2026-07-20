"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import RegulationPdfFrame from "@/features/regulations/components/RegulationPdfFrame";

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

export default function RegulationViewer({
  open,
  onClose,
  title,
  src,
  copy,
}: RegulationViewerProps) {
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

        <RegulationPdfFrame
          src={src}
          title={title}
          loadingText={copy.loading}
          errorText={copy.error}
          className="min-h-0 flex-1"
        />
      </section>
    </div>,
    document.body,
  );
}
