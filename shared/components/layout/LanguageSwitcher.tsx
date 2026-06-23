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
    if (!open || mobile) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
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
        <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#172430]/65">
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
                className={`group relative overflow-hidden rounded-full border px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] shadow-[0_10px_26px_rgba(20,49,71,0.08)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-0.5 ${
                  active
                    ? "border-[#8eb6d3]/75 bg-white/72 text-[#172430]"
                    : "border-white/65 bg-[#eef2f4]/62 text-[#172430]/72 hover:border-white/80 hover:bg-white/62 hover:text-[#172430]"
                }`}
              >
                <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                <span className="absolute inset-0 bg-[#72a0c1]/[0.03]" />
                <span className="relative z-10">
                  {languageLabels[item].short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative z-[999]">
      <button
        type="button"
        aria-label={t.header.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.13em] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[1px] ${
          transparent
            ? "border-white/48 bg-white/10 text-white shadow-[0_14px_34px_rgba(0,0,0,0.18)] hover:border-white/70 hover:bg-white/18"
            : "border-[#b9d9eb]/65 bg-white/64 text-[#172430] shadow-[0_14px_34px_rgba(114,160,193,0.16)] hover:border-[#8eb6d3]/75 hover:bg-white/82"
        }`}
      >
        <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />

        <Globe size={14} className="relative z-10 shrink-0" />
        <span className="relative z-10">{languageLabels[language].short}</span>
        <ChevronDown
          size={14}
          className={`relative z-10 shrink-0 transition-transform duration-500 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        role="listbox"
        className={`absolute right-0 top-[calc(100%+0.85rem)] z-[999] min-w-52 overflow-hidden rounded-[28px] border border-white/35 bg-[#eef2f4]/72 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur-[28px] transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.08))]" />
        <span className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#b9d9eb]/28 blur-3xl" />
        <span className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-white/28 blur-3xl" />

        <div className="relative z-10 grid gap-1">
          {languages.map((item) => {
            const active = item === language;

            return (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => chooseLanguage(item)}
                className={`group relative flex w-full items-center justify-between overflow-hidden rounded-[20px] px-4 py-3.5 text-left text-sm font-medium text-[#172430] transition-all duration-500 ${
                  active
                    ? "bg-white/52 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_28px_rgba(20,49,71,0.10)]"
                    : "hover:bg-white/45 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_28px_rgba(20,49,71,0.10)]"
                }`}
              >
                <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/0 to-transparent transition-all duration-500 group-hover:via-white/90" />
                <span className="absolute inset-0 bg-[#72a0c1]/0 transition-colors duration-500 group-hover:bg-[#72a0c1]/[0.035]" />

                <span className="relative z-10">{languageLabels[item].label}</span>

                <span
                  className={`relative z-10 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.68rem] transition-all duration-500 ${
                    active
                      ? "border-[#72a0c1]/70 bg-white/75 text-[#4d88b2] shadow-[0_6px_16px_rgba(114,160,193,0.18)]"
                      : "border-white/45 bg-white/30 text-transparent group-hover:border-[#b9d9eb]/70 group-hover:bg-white/60"
                  }`}
                >
                  •
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
