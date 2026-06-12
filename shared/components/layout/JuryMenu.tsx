"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryMenu({
  mobile = false,
  onNavigate,
  dropDirection = "down",
  dropAlign = "right",
  transparent = false,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
  dropDirection?: "up" | "down";
  dropAlign?: "left" | "right";
  transparent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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

  const menuItems = [
    { href: "/apply", label: t.common.applyAsParticipant },
    { href: "/apply/jury", label: t.common.applyAsJury },
    { href: "/jury/login", label: t.common.juryAccount },
  ];

  if (mobile) {
    return (
      <div className="grid gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center justify-between rounded-[24px] border border-black/10 bg-white px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    );
  }

  const dropPositionClass = [
    dropDirection === "up"
      ? "bottom-[calc(100%+0.7rem)] origin-bottom"
      : "top-[calc(100%+0.7rem)] origin-top",
    dropAlign === "left" ? "left-0" : "right-0",
  ].join(" ");

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${transparent ? "border-white/35 bg-white text-[var(--color-ink)] hover:border-white hover:bg-[var(--color-ink)] hover:text-white" : "border-[var(--color-ink)] bg-[var(--color-ink)] text-white shadow-[0_14px_30px_rgba(3,2,19,0.14)] hover:bg-white hover:text-[var(--color-ink)]"}`}
      >
        <span>{t.common.applyNow}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute z-50 min-w-64 overflow-hidden rounded-[24px] border border-black/10 bg-white p-2 shadow-[0_24px_60px_rgba(3,2,19,0.14)] transition-all duration-300 ${dropPositionClass} ${open ? "pointer-events-auto translate-y-0 opacity-100" : `${dropDirection === "up" ? "translate-y-2" : "-translate-y-2"} pointer-events-none opacity-0`}`}
      >
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center rounded-[18px] px-4 py-3 text-sm text-[var(--color-ink)] transition hover:bg-black hover:text-white"
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
