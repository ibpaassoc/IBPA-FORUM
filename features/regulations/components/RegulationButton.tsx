"use client";

import { Download, Eye, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
      ? "flex min-h-[74px] w-full items-center justify-between gap-4 rounded-[24px] border border-[rgba(114,160,193,0.24)] bg-white/76 px-5 py-4 text-left shadow-[0_16px_44px_rgba(79,115,139,0.09)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-[rgba(114,160,193,0.46)] hover:shadow-[0_20px_54px_rgba(79,115,139,0.14)]"
      : "inline-flex min-h-[58px] min-w-[122px] shrink-0 items-center justify-center gap-2.5 rounded-[18px] border border-[rgba(114,160,193,0.24)] bg-white/78 px-4 py-3 text-[#356f98] shadow-[0_10px_28px_rgba(79,115,139,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={actionsOpen}
        aria-haspopup="menu"
        onClick={() => setActionsOpen((current) => !current)}
        className={`${buttonClass} ${!available ? "text-[var(--color-ink-muted)]" : ""} ${className}`}
      >
        <span className={`flex items-center ${variant === "general" ? "gap-3" : "gap-2.5"}`}>
          <span className={`${variant === "general" ? "flex size-11 items-center justify-center rounded-[16px] border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)]" : ""}`}>
            <FileText aria-hidden size={variant === "general" ? 20 : 19} strokeWidth={1.65} />
          </span>
          <span>
            <span className={`block font-semibold ${variant === "general" ? "text-sm uppercase tracking-[0.11em]" : "text-sm"}`}>
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
          <span className="rounded-full border border-[rgba(114,160,193,0.22)] bg-white/76 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)]">
            PDF
          </span>
        ) : null}
      </button>

      {actionsOpen
        ? createPortal(
            <div
              ref={popupRef}
              role="menu"
              style={{ top: popupPosition.top, left: popupPosition.left }}
              className="fixed z-[90] w-[210px] rounded-[20px] border border-white/80 bg-white/86 p-2 shadow-[0_24px_70px_rgba(20,38,51,0.22)] backdrop-blur-2xl"
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
                    className="flex min-h-11 w-full items-center gap-3 rounded-[14px] px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)]"
                  >
                    <Eye aria-hidden size={17} className="text-[var(--color-blue)]" />
                    {copy.view}
                  </button>
                  <a
                    role="menuitem"
                    href={regulationUrl(regulationKey, language, true)}
                    onClick={() => setActionsOpen(false)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-[14px] px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)]"
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
            </div>,
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
