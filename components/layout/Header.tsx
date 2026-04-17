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
    <header className="sticky top-0 z-50 w-full border-b border-[#1c2947] bg-[linear-gradient(135deg,#03143b,#071b4d_60%,#0b245f)] text-white shadow-[0_14px_40px_rgba(1,8,24,0.45)]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="IBPA home" className="shrink-0">
          <Image
            src="/logo.svg"
            alt="IBPA Logo"
            width={220}
            height={80}
            className="h-12 w-auto object-contain sm:h-14"
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/78 transition hover:text-yellow-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/apply/jury"
            className="inline-flex items-center justify-center rounded-full border border-yellow-500/45 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-yellow-500 hover:text-yellow-500"
          >
            Apply as Jury
          </Link>

          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-full bg-yellow-500 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:opacity-90"
          >
            Apply Now
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white transition hover:border-yellow-500/50 hover:text-yellow-500 lg:hidden"
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
        className={`overflow-hidden border-t border-white/10 bg-[#061947] transition-all duration-300 ease-in-out lg:hidden ${
          open ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-3 px-4 py-4 sm:px-6">
          <div className="grid gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className="rounded-2xl px-4 py-3 text-sm font-medium uppercase tracking-[0.16em] text-white/78 transition hover:bg-white/5 hover:text-yellow-500"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Link
              href="/apply/jury"
              onClick={handleLinkClick}
              className="inline-flex justify-center rounded-full border border-yellow-500/45 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-yellow-500 hover:text-yellow-500"
            >
              Apply as Jury
            </Link>

            <Link
              href="/apply"
              onClick={handleLinkClick}
              className="inline-flex justify-center rounded-full bg-yellow-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black transition hover:opacity-90"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
