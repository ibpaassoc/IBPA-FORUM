"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import TicketForm from "./TicketForm";

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TicketModal({ isOpen, onClose }: TicketModalProps) {
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

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ticket-modal-overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(17,26,34,0.58)] px-4 py-6 backdrop-blur-[3px] sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            key="ticket-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
            className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[32px] border border-[var(--border-default)] bg-white shadow-[0_40px_100px_rgba(18,34,46,0.28)]"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,rgba(114,160,193,0.2)_0%,rgba(114,160,193,0.7)_45%,rgba(185,217,235,0.75)_100%)]" />

            <div className="flex shrink-0 items-start justify-between gap-5 border-b border-[var(--border-soft)] px-6 py-5">
              <div>
                <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                  IBPA BEAUTY AWARD 2026
                </p>

                <h2
                  id="ticket-modal-title"
                  className="text-[1.65rem] leading-[1.06] tracking-[-0.01em] [font-family:var(--font-accent-family)] text-[var(--color-ink)]"
                >
                  Buy Tickets
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--color-off-white)] text-[1rem] font-medium text-[var(--color-ink-soft)] shadow-[0_4px_12px_rgba(37,42,45,0.08)] transition hover:-translate-y-px hover:border-[var(--color-hover-accent)] hover:bg-white hover:text-[var(--color-hover-accent)]"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 [font-family:var(--font-legal-family)]">
              <TicketForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(modal, document.body);
}
