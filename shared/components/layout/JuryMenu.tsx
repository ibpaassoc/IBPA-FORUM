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
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
          Jury
        </p>
        <Link
          href="/apply/jury"
          onClick={onNavigate}
          className="inline-flex justify-center rounded-2xl border border-[#d8c27a]/25 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
        >
          Apply as Jury
        </Link>
        <Link
          href="/jury/login"
          onClick={onNavigate}
          className="inline-flex justify-center rounded-2xl border border-white/12 bg-white/[0.045] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a]/35 hover:text-[#d8c27a]"
        >
          Log In / Register
        </Link>
      </div>
    );
  }

  const buttonClassName =
    "inline-flex items-center justify-center rounded-full border border-[#d8c27a]/35 bg-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a] hover:bg-white/8 hover:text-[#d8c27a]";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={buttonClassName}
        aria-expanded={open}
      >
        Jury
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-3 min-w-60 rounded-3xl border border-white/12 bg-[#101011] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.38)]"
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
