"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import { ticketTranslations } from "@/features/tickets/copy";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import TicketForm from "./TicketForm";

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TicketModal({ isOpen, onClose }: TicketModalProps) {
  const { language } = useLanguage();
  const copy = ticketTranslations[language].modal;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
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
          transition={{ duration: reducedMotion ? 0 : 0.24 }}
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
            className="no-scrollbar relative max-h-[96dvh] w-full max-w-[1040px] overflow-y-auto overscroll-contain rounded-[26px] border border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(238,248,253,0.96))] font-[var(--font-ui-family)] shadow-[0_40px_110px_rgba(3,18,38,0.38)] sm:max-h-[92vh] sm:rounded-[30px]"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 34, scale: reducedMotion ? 1 : 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 18, scale: reducedMotion ? 1 : 0.985 }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 330, damping: 30 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,rgba(114,160,193,0.2)_0%,rgba(114,160,193,0.7)_45%,rgba(185,217,235,0.75)_100%)]" />

            <motion.div
              className="flex items-start justify-between gap-5 px-5 pb-3 pt-5 sm:px-8 sm:pt-7"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.08, duration: reducedMotion ? 0 : 0.3 }}
            >
              <div>
                <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                  {copy.eyebrow}
                </p>

                <h2
                  id="ticket-modal-title"
                  className="font-[var(--font-title-family)] text-[2rem] font-light leading-none tracking-[-0.04em] text-[#10182a] sm:text-[2.45rem]"
                >
                  {copy.title}
                </h2>
              </div>

              <motion.button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={copy.close}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.3)] bg-white/80 text-[#35536a] shadow-[0_8px_24px_rgba(114,160,193,0.12)] backdrop-blur-xl transition-colors hover:border-[var(--color-blue)]/60 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-blue)]/20"
                whileHover={reducedMotion ? undefined : { y: -2, rotate: 3 }}
                whileTap={reducedMotion ? undefined : { scale: 0.94 }}
              >
                <X aria-hidden size={18} strokeWidth={1.8} />
              </motion.button>
            </motion.div>

            <motion.div
              className="px-4 pb-5 sm:px-8 sm:pb-7"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.12, duration: reducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <TicketForm />
            </motion.div>
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
