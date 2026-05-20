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
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay-dark) p-(--space-sm)"
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
        className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[calc(var(--radius)-2px)] border border-(--border-default) bg-(--surface-elevated) shadow-(--shadow-lg)"
      >
        <div className="flex items-start justify-between border-b border-(--border-soft) px-(--space-md) py-(--space-sm)">
          <h2
            id={labelledById}
            className="pr-(--space-sm) text-[clamp(1.5rem,3vw,2rem)] leading-[1.1] [font-family:var(--font-accent-family)] text-(--color-ink)"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border-soft) text-[1.2rem] text-(--color-ink-soft) hover:border-(--color-hover) hover:text-(--color-hover)"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(88vh-5.5rem)] overflow-y-auto px-(--space-md) py-(--space-md) [font-family:var(--font-legal-family)] text-[0.97rem] leading-[1.8] text-(--color-ink-soft)">
          {children}
        </div>
      </div>
    </div>
  );
}
