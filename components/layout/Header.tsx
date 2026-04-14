"use client";

import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-border-main bg-background-header">
      <div className="relative mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Image
         src="/logo.png"
         alt="IBPA Logo"
         width={220}
         height={70}
         className="h-18 w-auto"
        />

        {/* Desktop navigation centered */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 lg:flex gap-12 text-base uppercase tracking-wider">
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

        {/* Right side */}
        <div className="ml-auto flex items-center gap-4">

          <a
            href="#"
            className="hidden rounded-full bg-yellow-500 px-5 py-2 font-medium text-black transition hover:opacity-90 lg:inline-flex"
          >
            Apply Now
          </a>

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center text-xl text-black lg:hidden"
            aria-label="Toggle menu"
          >
            ☰
          </button>

        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border-main bg-background-header lg:hidden">
          <div className="flex flex-col gap-4 px-4 py-4 text-base uppercase tracking-wider">

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

            <a
              href="#"
              className="rounded-full bg-yellow-500 px-5 py-2 text-center font-medium text-black"
            >
              Apply Now
            </a>

          </div>
        </div>
      )}
    </header>
  );
}
