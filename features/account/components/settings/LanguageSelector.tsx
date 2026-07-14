"use client";

import { Check } from "lucide-react";
import { languageLabels, languages, type Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Segmented glass control for the applicant account language. Uses the
 * existing LanguageProvider, which persists the choice to localStorage and
 * the `ibpa-language` cookie, so the selection survives refreshes and is
 * picked up by server components on the next request.
 */
export default function LanguageSelector({ ariaLabel }: { ariaLabel: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-1.5 rounded-[22px] border border-[rgba(114,160,193,0.2)] bg-white/62 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl sm:grid-cols-3"
    >
      {languages.map((code: Language) => {
        const selected = language === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setLanguage(code)}
            className={`flex min-h-11 items-center justify-between gap-2 rounded-[17px] px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] ${
              selected
                ? "bg-[var(--color-blue)] text-white shadow-[0_12px_26px_rgba(114,160,193,0.28)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]"
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              <span
                className={`text-[0.62rem] font-bold uppercase tracking-[0.14em] ${
                  selected ? "text-white/75" : "text-[var(--color-blue)]"
                }`}
              >
                {languageLabels[code].short}
              </span>
              {languageLabels[code].label}
            </span>
            {selected ? <Check aria-hidden size={15} strokeWidth={2.6} /> : null}
          </button>
        );
      })}
    </div>
  );
}
