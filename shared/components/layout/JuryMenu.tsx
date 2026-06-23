"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";

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
            className="group relative flex items-center justify-between overflow-hidden rounded-[24px] border border-white/65 bg-[#eef2f4]/70 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#172430] shadow-[0_12px_30px_rgba(20,49,71,0.10)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/62"
          >
            <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            <span className="absolute inset-0 bg-[#72a0c1]/[0.03]" />
            <span className="relative z-10">{item.label}</span>
            <ArrowUpRight
              size={15}
              className="relative z-10 text-[#4d88b2] transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        ))}
      </div>
    );
  }

  const dropPositionClass = [
    dropDirection === "up"
      ? "bottom-[calc(100%+0.85rem)] origin-bottom"
      : "top-[calc(100%+0.85rem)] origin-top",
    dropAlign === "left" ? "left-0" : "right-0",
  ].join(" ");

  return (
    <div ref={containerRef} className="relative z-[999] inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full border px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.13em] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[1px] ${
          transparent
            ? "border-white/48 bg-white/10 text-white shadow-[0_14px_34px_rgba(0,0,0,0.18)] hover:border-white/70 hover:bg-white/18"
            : "border-[#b9d9eb]/65 bg-white/64 text-[#172430] shadow-[0_14px_34px_rgba(114,160,193,0.16)] hover:border-[#8eb6d3]/75 hover:bg-white/82"
        }`}
      >
        <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
        <span className="relative z-10">{t.common.applyNow}</span>
        <ChevronDown
          size={14}
          className={`relative z-10 transition-transform duration-500 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute z-[999] min-w-72 overflow-hidden rounded-[28px] border border-white/35 bg-[#eef2f4]/72 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur-[28px] transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${dropPositionClass} ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : `${dropDirection === "up" ? "translate-y-2" : "-translate-y-2"} pointer-events-none scale-[0.98] opacity-0`
        }`}
      >
        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.08))]" />
        <span className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#b9d9eb]/28 blur-3xl" />
        <span className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-white/28 blur-3xl" />

        <div className="relative z-10 grid gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="group relative flex items-center justify-between overflow-hidden rounded-[20px] px-4 py-3.5 text-sm font-medium text-[#172430] transition-all duration-500 hover:bg-white/45 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_28px_rgba(20,49,71,0.10)]"
            >
              <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/0 to-transparent transition-all duration-500 group-hover:via-white/90" />
              <span className="absolute inset-0 bg-[#72a0c1]/0 transition-colors duration-500 group-hover:bg-[#72a0c1]/[0.035]" />
              <span className="relative z-10">{item.label}</span>
              <ArrowUpRight
                size={14}
                className="relative z-10 text-[#4d88b2] transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
