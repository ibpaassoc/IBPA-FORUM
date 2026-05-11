"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/shared/components/layout/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import JuryMenu from "@/shared/components/layout/JuryMenu";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const navigation = [
    { href: "/", label: t.header.navigation.home },
    { href: "/categories", label: t.header.navigation.categories },
    { href: "/jury", label: t.header.navigation.jury },
    { href: "/grand-prix", label: t.header.navigation.grandPrix },
  ];

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
    <header className="fixed inset-x-0 top-0 z-100 w-full border-b border-[var(--border-default)] bg-[rgba(255,255,255,0.94)] px-[var(--page-gutter)] shadow-[var(--shadow-sm)] backdrop-blur-[16px]">
      <div className="mx-auto max-w-[var(--content-width)]">
        <div className="relative flex h-[clamp(60px,8vh,72px)] items-center gap-[var(--space-sm)]">
          <Link href="/" aria-label="IBPA home" className="min-w-0 shrink">
            <Image
              src="/logo_black.png"
              alt="IBPA Logo"
              width={320}
              height={80}
              className="h-10 w-auto max-w-42.5 object-contain sm:h-12 sm:max-w-none"
            />
          </Link>

          <nav className="ml-auto mr-[var(--space-md)] hidden items-center gap-[var(--space-md)] lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-[var(--font-sans)] text-[clamp(0.7rem,1vw,0.8rem)] font-medium uppercase tracking-[0.1em] text-[var(--color-ink)] opacity-75 transition hover:text-[var(--color-hover)] hover:opacity-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <JuryMenu />

            <Link
              href="/apply"
              className="ibpa-button ibpa-button-primary"
            >
              {t.common.applyNow}
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--color-white)] text-[var(--color-ink)] shadow-[var(--shadow-sm)] transition hover:border-[var(--color-hover)] hover:text-[var(--color-hover)] sm:h-11 sm:w-11 lg:hidden"
          >
            <span className="sr-only">
              {open ? t.header.closeMenu : t.header.openMenu}
            </span>

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
          className={`relative overflow-hidden border-t border-[var(--border-default)] transition-all duration-300 ease-in-out lg:hidden ${
            open ? "max-h-128 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-4 py-[var(--space-md)]">
            <div className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="rounded-[var(--radius-sm)] border border-transparent bg-[var(--color-mist)] px-[var(--space-md)] py-[var(--space-sm)] text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-ink)] transition hover:border-[var(--color-hover)] hover:text-[var(--color-hover)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="grid gap-3 border-t border-[var(--border-default)] pt-[var(--space-md)]">
              <LanguageSwitcher mobile />
              <JuryMenu mobile onNavigate={handleLinkClick} />

              <Link
                href="/apply"
                onClick={handleLinkClick}
                className="ibpa-button ibpa-button-primary"
              >
                {t.common.applyNow}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
