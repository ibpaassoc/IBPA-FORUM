"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
        <Image
        src="/logo.svg"
        alt="IBPA Logo"
        width={220}
        height={80}
        className="h-14 w-auto object-contain"
        />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 lg:flex items-center gap-12 text-base uppercase tracking-wider">
          <a href="#" className="text-black transition hover:text-yellow-500">
            Home
          </a>
          <a href="#" className="text-black transition hover:text-yellow-500">
            Categories
          </a>
          <a href="#" className="text-black transition hover:text-yellow-500">
            Jury
          </a>
          <a href="#" className="text-black transition hover:text-yellow-500">
            Grand Prix
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <a
            href="#"
            className="hidden rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90 lg:inline-flex"
          >
            Apply Now
          </a>

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
          <a
            href="#"
            onClick={handleLinkClick}
            className="rounded-xl px-4 py-3 text-base uppercase tracking-wider text-black transition hover:bg-black/5 hover:text-yellow-500"
          >
            Home
          </a>
          <a
            href="#"
            onClick={handleLinkClick}
            className="rounded-xl px-4 py-3 text-base uppercase tracking-wider text-black transition hover:bg-black/5 hover:text-yellow-500"
          >
            Categories
          </a>
          <a
            href="#"
            onClick={handleLinkClick}
            className="rounded-xl px-4 py-3 text-base uppercase tracking-wider text-black transition hover:bg-black/5 hover:text-yellow-500"
          >
            Jury
          </a>
          <a
            href="#"
            onClick={handleLinkClick}
            className="rounded-xl px-4 py-3 text-base uppercase tracking-wider text-black transition hover:bg-black/5 hover:text-yellow-500"
          >
            Grand Prix
          </a>

          <a
            href="#"
            onClick={handleLinkClick}
            className="mt-3 inline-flex justify-center rounded-full bg-yellow-500 px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
          >
            Apply Now
          </a>
        </div>
      </div>
    </header>
  );
}
