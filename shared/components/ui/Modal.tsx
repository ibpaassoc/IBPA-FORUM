"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  labelledById: string;
};

export default function Modal({ isOpen, onClose, title, children, labelledById }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(180deg,rgba(17,26,34,0.46)_0%,rgba(17,26,34,0.56)_100%)] p-(--space-sm) backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        className="relative max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[calc(var(--radius)-2px)] border border-(--border-default) bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_35px_90px_rgba(18,34,46,0.24)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,rgba(114,160,193,0.2)_0%,rgba(114,160,193,0.65)_35%,rgba(185,217,235,0.7)_100%)]" />
        <div className="flex items-start justify-between border-b border-(--border-soft) px-[clamp(1rem,2.8vw,1.8rem)] py-[clamp(0.9rem,1.8vw,1.2rem)]">
          <h2
            id={labelledById}
            className="pr-(--space-sm) text-[clamp(1.65rem,3.2vw,2.5rem)] leading-[1.06] tracking-[-0.01em] [font-family:var(--font-accent-family)] text-(--color-ink)"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-(--border-default) bg-(--color-off-white) text-[1.1rem] font-medium text-(--color-ink-soft) shadow-[0_8px_18px_rgba(37,42,45,0.08)] transition hover:-translate-y-px hover:border-(--color-hover) hover:bg-(--surface) hover:text-(--color-hover)"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="max-h-[calc(88vh-6rem)] overflow-y-auto px-[clamp(1rem,2.8vw,1.8rem)] py-[clamp(1rem,2.6vw,1.5rem)] [font-family:var(--font-legal-family)] text-[clamp(0.98rem,1.2vw,1.08rem)] leading-[1.85] text-(--color-ink-soft)">
          {children}
        </div>
      </div>
    </div>
  );
}
