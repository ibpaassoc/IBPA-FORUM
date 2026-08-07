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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(5,22,43,0.68)] px-2 py-2 backdrop-blur-[6px] sm:px-5 sm:py-5"
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
            className="relative max-h-[96dvh] w-full max-w-[1040px] overflow-y-auto overscroll-contain rounded-[26px] border border-white/85 bg-[rgba(250,253,255,0.96)] font-[var(--font-ui-family)] shadow-[0_40px_110px_rgba(3,18,38,0.38)] sm:max-h-[92vh] sm:rounded-[30px]"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,rgba(114,160,193,0.2)_0%,rgba(114,160,193,0.7)_45%,rgba(185,217,235,0.75)_100%)]" />

            <div className="flex items-start justify-between gap-5 px-5 pb-3 pt-5 sm:px-8 sm:pt-7">
              <div>
                <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                  IBPA BEAUTY AWARD 2026
                </p>

                <h2
                  id="ticket-modal-title"
                  className="font-[var(--font-title-family)] text-[2rem] font-light leading-none tracking-[-0.04em] text-[#10182a] sm:text-[2.45rem]"
                >
                  Buy Tickets
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#cfe0eb] bg-white/78 text-[1.25rem] font-light text-[#10182a]/70 shadow-[0_6px_16px_rgba(37,42,45,0.07)] transition hover:-translate-y-px hover:border-[#72a0c1] hover:text-[#2773c8]"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="px-4 pb-5 sm:px-8 sm:pb-7">
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
