"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  languageLabels,
  languages,
  type Language,
} from "@/lib/i18n/translations";

export default function LanguageSwitcher({
  mobile = false,
  onSelect,
  transparent = false,
}: {
  mobile?: boolean;
  onSelect?: () => void;
  transparent?: boolean;
}) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || mobile) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobile, open]);

  function chooseLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setOpen(false);
    onSelect?.();
  }

  if (mobile) {
    return (
      <div className="grid gap-3">
        <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-soft)]">
          {t.header.language}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((item) => {
            const active = item === language;

            return (
              <button
                key={item}
                type="button"
                onClick={() => chooseLanguage(item)}
                className={`rounded-full border px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${active ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white shadow-[0_16px_30px_rgba(3,2,19,0.14)]" : "border-black/10 bg-white text-[var(--color-ink)] hover:border-black/24 hover:bg-black hover:text-white"}`}
              >
                {languageLabels[item].short}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t.header.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${transparent ? "border-white/30 bg-white/10 text-white backdrop-blur-md hover:border-white hover:bg-white hover:text-[var(--color-ink)]" : "border-black/10 bg-white text-[var(--color-ink)] shadow-[0_10px_24px_rgba(3,2,19,0.05)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white"}`}
      >
        <Globe size={14} className="shrink-0" />
        <span>{languageLabels[language].short}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute right-0 top-[calc(100%+0.65rem)] z-50 min-w-44 overflow-hidden rounded-[24px] border border-black/10 bg-white p-2 shadow-[0_24px_60px_rgba(3,2,19,0.14)] transition-all duration-300 ${open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
      >
        {languages.map((item) => {
          const active = item === language;

          return (
            <button
              key={item}
              type="button"
              onClick={() => chooseLanguage(item)}
              className={`flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-sm transition ${active ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-ink)] hover:bg-black/[0.04]"}`}
            >
              <span>{languageLabels[item].label}</span>
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.68rem] ${active ? "border-white/30 bg-white/10" : "border-black/10 bg-black/[0.03] text-transparent"}`}
              >
                •
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
