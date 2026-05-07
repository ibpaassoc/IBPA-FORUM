"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { languageLabels, languages, type Language } from "@/lib/i18n/translations";

export default function LanguageSwitcher({
  mobile = false,
  onSelect,
}: {
  mobile?: boolean;
  onSelect?: () => void;
}) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobile) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [mobile]);

  const chooseLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setOpen(false);
    onSelect?.();
  };

  if (mobile) {
    return (
      <div className="grid gap-2">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
          {t.header.language}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => chooseLanguage(item)}
              className={`rounded-2xl border px-3 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition ${
                item === language
                  ? "border-[#d8c27a] bg-[#d8c27a] text-[#111111]"
                  : "border-white/12 bg-white/4.5 text-[#f5f1e8] hover:border-[#d8c27a]/35 hover:text-[#d8c27a]"
              }`}
            >
              {languageLabels[item].short}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t.header.language}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a]/45 hover:text-[#d8c27a]"
      >
        {languageLabels[language].short}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 min-w-44 rounded-3xl border border-white/12 bg-[#101011] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.38)]">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => chooseLanguage(item)}
              className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                item === language
                  ? "bg-[#d8c27a] text-[#111111]"
                  : "text-white hover:bg-white/6 hover:text-[#d8c27a]"
              }`}
            >
              {languageLabels[item].label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
