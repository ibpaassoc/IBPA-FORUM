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
    if (mobile) return;

    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [mobile]);

  const menuItems = [
    { href: "/apply", label: t.common.applyAsParticipant, primary: true },
    { href: "/apply/jury", label: t.common.applyAsJury, primary: false },
    { href: "/jury/login", label: t.common.juryAccount, primary: false },
  ];

  if (mobile) {
    return (
      <div className="grid gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={item.primary ? "ibpa-button ibpa-button-primary" : "ibpa-button ibpa-button-ghost"}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  const dropPositionClass = [
    dropDirection === "up" ? "bottom-full mb-[var(--space-sm)]" : "top-full mt-[var(--space-sm)]",
    dropAlign === "left" ? "left-0" : "right-0",
  ].join(" ");

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition-all duration-300 hover:scale-105 ${
          transparent
            ? "bg-white text-[var(--color-ink)] hover:bg-white/90"
            : "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink)]/90"
        }`}
        aria-expanded={open}
      >
        {t.common.applyNow}
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          className={`absolute z-50 min-w-60 rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-white)] p-[var(--space-xs)] shadow-[var(--shadow-md)] ${dropPositionClass}`}
        >
          {menuItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={`block rounded-sm px-[var(--space-sm)] py-[var(--space-sm)] text-sm font-medium transition ${
                item.primary
                  ? "text-[var(--color-hover-accent)] hover:bg-[var(--surface-tint)]"
                  : "text-[var(--color-ink)] hover:bg-[var(--color-mist)] hover:text-[var(--color-hover-accent)]"
              } ${i > 0 ? "mt-[var(--space-xs)]" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
