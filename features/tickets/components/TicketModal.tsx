"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TicketForm from "./TicketForm";

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TicketModal({ isOpen, onClose }: TicketModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ticket-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(180deg,rgba(17,26,34,0.48)_0%,rgba(17,26,34,0.58)_100%)] p-4 backdrop-blur-[2px] sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="ticket-modal-card"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_40px_100px_rgba(18,34,46,0.28)]"
          >
            {/* Top accent line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,rgba(114,160,193,0.2)_0%,rgba(114,160,193,0.65)_35%,rgba(185,217,235,0.7)_100%)]" />

            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-[var(--border-soft)] px-6 py-5">
              <div>
                <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                  Beauty Business Forum USA 2026
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

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 [font-family:var(--font-legal-family)]">
              <TicketForm onSuccess={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
