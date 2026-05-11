"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryMenu({
  mobile = false,
  onNavigate,
  className = "",
}: {
  mobile?: boolean;
  onNavigate?: () => void;
  className?: string ;
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
        <p className="px-1 text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-(--color-hover)">
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

  const buttonClassName = ["ibpa-button ibpa-button-ghost px-[var(--space-sm)] py-[var(--space-xs)]", className].join(" ");

  return (
    <div ref={containerRef} className="relative inline">
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
          className="absolute left-0 top-full z-50 mt-(--space-sm) min-w-60 rounded-(--radius) border border-(--border-default) bg-(--color-white) p-(--space-xs) shadow-(--shadow-md)"
        >
          <Link
            href="/apply/jury"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="block rounded-sm px-(--space-sm) py-(--space-sm) text-sm font-medium text-(--color-navy) transition hover:bg-(--color-mist) hover:text-(--color-hover)"
          >
            {t.common.applyAsJury}
          </Link>
          <Link
            href="/jury/login"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="mt-(--space-xs) block rounded-sm px-(--space-sm) py-(--space-sm) text-sm font-medium text-(--color-navy) transition hover:bg-(--color-mist) hover:text-(--color-hover)"
          >
            {t.common.juryAccount}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
