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
        <p className="px-1 text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-hover)]">
          {t.header.language}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => chooseLanguage(item)}
              className={`rounded-[var(--radius-sm)] border px-[var(--space-sm)] py-[var(--space-sm)] text-sm font-medium uppercase tracking-[0.14em] transition ${
                item === language
                  ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-navy-deep)]"
                  : "border-[var(--border-default)] bg-[var(--color-white)] text-[var(--color-navy)] hover:border-[var(--color-hover)] hover:text-[var(--color-hover)]"
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
        className="ibpa-button ibpa-button-ghost px-[var(--space-sm)] py-[var(--space-xs)]"
      >
        {languageLabels[language].short}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-[var(--space-sm)] min-w-44 rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-white)] p-[var(--space-xs)] shadow-[var(--shadow-md)]">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => chooseLanguage(item)}
              className={`block w-full rounded-[var(--radius-sm)] px-[var(--space-sm)] py-[var(--space-sm)] text-left text-sm font-medium transition ${
                item === language
                  ? "bg-[var(--color-gold)] text-[var(--color-navy-deep)]"
                  : "text-[var(--color-navy)] hover:bg-[var(--color-mist)] hover:text-[var(--color-hover)]"
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
