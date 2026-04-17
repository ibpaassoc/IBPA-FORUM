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
    <header className="top-0 z-50 w-full border-b border-border-main bg-background-header/95 backdrop-blur">
      <div className="relative mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="IBPA home">
          <Image
            src="/logo.svg"
            alt="IBPA Logo"
            width={220}
            height={80}
            className="h-14 w-auto object-contain"
          />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-12 text-base uppercase tracking-wider lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-black transition hover:text-yellow-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/apply"
            className="hidden rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90 lg:inline-flex"
          >
            Apply Now
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border-main bg-white text-black transition hover:bg-black hover:text-white lg:hidden"
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
      </div>

      <div
        className={`overflow-hidden border-t border-border-main bg-background-header transition-all duration-300 ease-in-out lg:hidden ${
          open ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className="rounded-xl px-4 py-3 text-base uppercase tracking-wider text-black transition hover:bg-black/5 hover:text-yellow-500"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/apply"
            onClick={handleLinkClick}
            className="mt-3 inline-flex justify-center rounded-full bg-yellow-500 px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </header>
  );
}
