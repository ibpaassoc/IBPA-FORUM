"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function JuryMenu({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const buttonClassName = mobile
    ? "inline-flex justify-center rounded-full border border-[#d8c27a]/35 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
    : "inline-flex items-center justify-center rounded-full border border-[#d8c27a]/35 bg-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a] hover:bg-white/8 hover:text-[#d8c27a]";

  return (
    <div ref={containerRef} className={`relative ${mobile ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${buttonClassName} ${mobile ? "w-full" : ""}`}
        aria-expanded={open}
      >
        Jury
      </button>

      {open ? (
        <div
          className={`z-50 mt-3 min-w-60 rounded-3xl border border-white/12 bg-[#101011] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.38)] ${
            mobile ? "static w-full" : "absolute right-0 top-full"
          }`}
        >
          <Link
            href="/apply/jury"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="block rounded-2xl px-4 py-3 text-sm font-medium text-white transition hover:bg-white/6 hover:text-[#d8c27a]"
          >
            Apply as Jury
          </Link>
          <Link
            href="/jury/login"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="mt-2 block rounded-2xl px-4 py-3 text-sm font-medium text-white transition hover:bg-white/6 hover:text-[#d8c27a]"
          >
            Log In / Register
          </Link>
        </div>
      ) : null}
    </div>
  );
}
