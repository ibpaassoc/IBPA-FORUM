"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryMenu({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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

  if (mobile) {
    return (
      <div className="grid gap-3">
        <p className="px-1 text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-gold)]">
          {t.common.jury}
        </p>
        <Link
          href="/apply/jury"
          onClick={onNavigate}
          className="ibpa-button ibpa-button-ghost"
        >
          {t.common.applyAsJury}
        </Link>
        <Link
          href="/jury/login"
          onClick={onNavigate}
          className="ibpa-button ibpa-button-ghost"
        >
          {t.common.juryAccount}
        </Link>
      </div>
    );
  }

  const buttonClassName =
    "ibpa-button ibpa-button-ghost px-[var(--space-sm)] py-[var(--space-xs)]";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={buttonClassName}
        aria-expanded={open}
      >
        {t.common.jury}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-[var(--space-sm)] min-w-60 rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-white)] p-[var(--space-xs)] shadow-[var(--shadow-md)]"
        >
          <Link
            href="/apply/jury"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="block rounded-[var(--radius-sm)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-mist)] hover:text-[var(--color-gold)]"
          >
            {t.common.applyAsJury}
          </Link>
          <Link
            href="/jury/login"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="mt-[var(--space-xs)] block rounded-[var(--radius-sm)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-mist)] hover:text-[var(--color-gold)]"
          >
            {t.common.juryAccount}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
