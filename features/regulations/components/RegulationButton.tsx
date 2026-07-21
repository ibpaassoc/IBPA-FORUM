"use client";

import { ChevronDown, Download, Eye, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import RegulationViewer from "@/features/regulations/components/RegulationViewer";
import type {
  RegulationAvailability,
  RegulationKey,
  RegulationLanguage,
} from "@/features/regulations/types";
import { resolveRegulationLanguage } from "@/features/regulations/types";

export type RegulationButtonCopy = {
  regulations: string;
  view: string;
  download: string;
  noAvailable: string;
  loading: string;
  error: string;
  close: string;
  russianFallback: string;
};

type RegulationButtonProps = {
  regulationKey: RegulationKey;
  availability: RegulationAvailability;
  language: RegulationLanguage;
  title: string;
  copy: RegulationButtonCopy;
  variant?: "category" | "general";
  className?: string;
};

function regulationUrl(
  key: RegulationKey,
  language: RegulationLanguage,
  download = false,
) {
  const params = new URLSearchParams({ key, language });
  if (download) params.set("download", "1");
  return `/api/regulations/file?${params.toString()}`;
}

export default function RegulationButton({
  regulationKey,
  availability,
  language,
  title,
  copy,
  variant = "category",
  className = "",
}: RegulationButtonProps) {
  const reducedMotion = useReducedMotion();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const resolvedLanguage = resolveRegulationLanguage(availability, language);
  const available = resolvedLanguage !== null;
  const src = regulationUrl(regulationKey, language);

  useEffect(() => {
    if (!actionsOpen) return;

    function positionPopup() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const popupWidth = 210;
      const left = Math.min(
        window.innerWidth - popupWidth - 12,
        Math.max(12, rect.right - popupWidth),
      );
      setPopupPosition({ top: rect.bottom + 8, left });
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setActionsOpen(false);
    }

    positionPopup();
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", positionPopup);
    window.addEventListener("scroll", positionPopup, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", positionPopup);
      window.removeEventListener("scroll", positionPopup, true);
    };
  }, [actionsOpen]);

  const buttonClass =
    variant === "general"
      ? "group relative flex min-h-[64px] w-full items-center justify-between gap-4 overflow-hidden rounded-[20px] border border-[rgba(114,160,193,0.2)] bg-white/68 px-4 py-3 text-left shadow-[0_12px_34px_rgba(79,115,139,0.07)] backdrop-blur-2xl hover:border-[rgba(114,160,193,0.42)] hover:bg-white/82 hover:shadow-[0_18px_46px_rgba(79,115,139,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.24)] sm:px-5"
      : "group relative inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[15px] border border-[rgba(114,160,193,0.2)] bg-white/68 px-3.5 py-2 text-[#356f98] shadow-[0_8px_22px_rgba(79,115,139,0.06)] backdrop-blur-xl hover:border-[var(--color-blue)] hover:bg-white/88 hover:shadow-[0_12px_28px_rgba(79,115,139,0.11)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.24)]";

  return (
    <>
      <motion.button
        ref={buttonRef}
        type="button"
        aria-expanded={actionsOpen}
        aria-haspopup="menu"
        onClick={() => setActionsOpen((current) => !current)}
        whileTap={reducedMotion ? undefined : { scale: 0.975 }}
        className={`${buttonClass} ${!available ? "text-[var(--color-ink-muted)]" : ""} ${className}`}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/70 to-transparent"
          animate={actionsOpen && !reducedMotion ? { x: [0, 520] } : { x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <span className={`relative flex items-center ${variant === "general" ? "gap-3" : "gap-2.5"}`}>
          <motion.span
            animate={actionsOpen && !reducedMotion ? { rotate: [0, -5, 5, 0], scale: [1, 1.06, 1] } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className={variant === "general" ? "flex size-10 items-center justify-center rounded-[14px] border border-[rgba(114,160,193,0.18)] bg-[var(--color-blue-wash)] shadow-[inset_0_1px_0_white]" : ""}
          >
            <FileText aria-hidden size={variant === "general" ? 19 : 17} strokeWidth={1.65} />
          </motion.span>
          <span>
            <span className={`block font-semibold ${variant === "general" ? "text-[0.76rem] uppercase tracking-[0.12em]" : "text-[0.8rem]"}`}>
              {copy.regulations}
            </span>
            {variant === "general" && !available ? (
              <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[var(--color-ink-muted)]">
                {copy.noAvailable}
              </span>
            ) : null}
          </span>
        </span>
        {variant === "general" ? (
          <span className="relative flex items-center gap-2 rounded-[12px] border border-[rgba(114,160,193,0.2)] bg-white/76 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#5689ad]">
            PDF <Download aria-hidden size={13} strokeWidth={1.8} />
          </span>
        ) : (
          <motion.span animate={{ rotate: actionsOpen ? 180 : 0 }} className="relative flex text-[#7399b4]">
            <ChevronDown aria-hidden size={14} />
          </motion.span>
        )}
      </motion.button>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {actionsOpen ? (
                <motion.div
                  ref={popupRef}
                  role="menu"
                  style={{ top: popupPosition.top, left: popupPosition.left }}
                  initial={reducedMotion ? false : { opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed z-[90] w-[210px] origin-top-right rounded-[18px] border border-white/85 bg-white/82 p-2 shadow-[0_24px_70px_rgba(20,38,51,0.19)] backdrop-blur-2xl"
                >
                  {available ? (
                    <>
                      {resolvedLanguage !== language ? (
                        <p className="px-3 py-2 text-[0.68rem] leading-5 text-[var(--color-ink-muted)]">
                          {copy.russianFallback}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setActionsOpen(false);
                          setViewerOpen(true);
                        }}
                        className="flex min-h-11 w-full items-center gap-3 rounded-[13px] px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)]"
                      >
                        <Eye aria-hidden size={17} className="text-[var(--color-blue)]" />
                        {copy.view}
                      </button>
                      <a
                        role="menuitem"
                        href={regulationUrl(regulationKey, language, true)}
                        onClick={() => setActionsOpen(false)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-[13px] px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)]"
                      >
                        <Download aria-hidden size={17} className="text-[var(--color-blue)]" />
                        {copy.download}
                      </a>
                    </>
                  ) : (
                    <p className="px-3 py-3 text-sm leading-6 text-[var(--color-ink-soft)]">
                      {copy.noAvailable}
                    </p>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      {viewerOpen ? (
        <RegulationViewer
          open
          onClose={() => setViewerOpen(false)}
          title={title}
          src={src}
          copy={{ close: copy.close, loading: copy.loading, error: copy.error }}
        />
      ) : null}
    </>
  );
}
