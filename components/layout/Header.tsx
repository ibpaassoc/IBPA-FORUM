"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/jury", label: "Jury" },
  { href: "/grand-prix", label: "Grand Prix" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  const handleLinkClick = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-[#d8c27a]/18 bg-[linear-gradient(135deg,rgba(25,24,26,0.94),rgba(18,22,28,0.9)_55%,rgba(39,33,24,0.86))] shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,194,122,0.18),transparent_30%),radial-gradient(circle_at_right,rgba(255,255,255,0.06),transparent_28%)]" />

        <div className="relative flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-7">
          <Link href="/" aria-label="IBPA home" className="shrink-0">
            <Image
              src="/logo.svg"
              alt="IBPA Logo"
              width={220}
              height={80}
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <nav className="ml-auto mr-6 hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#efe6d0] transition hover:bg-white/8 hover:text-[#d8c27a]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/apply/jury"
              className="inline-flex items-center justify-center rounded-full border border-[#d8c27a]/35 bg-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a] hover:bg-white/8 hover:text-[#d8c27a]"
            >
              Apply as Jury
            </Link>

            <Link
              href="/under-development"
              className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
            >
              Apply Now
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-[#f5f1e8] transition hover:border-[#d8c27a]/40 hover:text-[#d8c27a] lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>

            <span
              className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${
                open ? "rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${
                open ? "-rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>
        </div>

        <div
          className={`relative overflow-hidden border-t border-white/10 transition-all duration-300 ease-in-out lg:hidden ${
            open ? "max-h-112 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-3 px-4 py-4 sm:px-6">
            <div className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="rounded-2xl border border-transparent bg-white/4 px-4 py-3 text-sm font-medium uppercase tracking-[0.16em] text-[#efe6d0] transition hover:border-[#d8c27a]/20 hover:bg-white/8 hover:text-[#d8c27a]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <Link
                href="/apply/jury"
                onClick={handleLinkClick}
                className="inline-flex justify-center rounded-full border border-[#d8c27a]/35 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
              >
                Apply as Jury
              </Link>

              <Link
                href="/under-development"
                onClick={handleLinkClick}
                className="inline-flex justify-center rounded-full bg-[#d8c27a] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
