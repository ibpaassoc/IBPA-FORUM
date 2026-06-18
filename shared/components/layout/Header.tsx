"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/shared/components/layout/LanguageSwitcher";
import JuryMenu from "@/shared/components/layout/JuryMenu";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const HERO_PAGES = ["/"];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const { language, t } = useLanguage();

  const isHeroPage = HERO_PAGES.includes(pathname);
  const useTransparent = isHeroPage && !scrolled;

  const associationLabel =
    language === "ru"
      ? "Association"
      : language === "ua"
        ? "Association"
        : "Association";

  const navigation = [
    { href: "/", label: t.header.navigation.home },
    { href: "/categories", label: t.header.navigation.categories },
    { href: "/jury", label: t.header.navigation.jury },
    { href: "/grand-prix", label: t.header.navigation.grandPrix },
    {
      href: "https://ibpassociations.org/about",
      label: associationLabel,
      external: true,
    },
  ];

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };

    updateHeaderHeight();

    const observer = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    observer.observe(header);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  function handleLinkClick() {
    setOpen(false);
  }

  function isActive(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-[100] w-full border-b px-[var(--page-gutter)] transition-all duration-500 ${
        useTransparent
          ? "border-transparent bg-transparent py-5 lg:py-7"
          : "border-[var(--border-default)] bg-white/92 py-3 shadow-[var(--shadow-sm)] backdrop-blur-[20px] lg:py-4"
      }`}
    >
      <div className="mx-auto max-w-[var(--content-width)]">
        <div className="relative flex items-center gap-[var(--space-sm)]">
          <Link
            href="/"
            aria-label="IBPA home"
            onClick={handleLinkClick}
            className="min-w-0 shrink"
          >
            <Image
              src="/logo_black.png"
              alt="IBPA Logo"
              width={320}
              height={80}
              priority
              className={`h-10 w-auto max-w-42.5 object-contain transition-all duration-500 sm:h-12 sm:max-w-none ${useTransparent ? "[filter:brightness(0)_invert(1)]" : ""}`}
            />
          </Link>

          <nav className="ml-auto mr-[var(--space-md)] hidden items-center gap-[var(--space-md)] lg:flex">
            {navigation.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`relative font-[var(--font-sans)] text-[clamp(0.7rem,1vw,0.78rem)] font-semibold uppercase tracking-[0.12em] transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform after:duration-300 ${useTransparent ? "text-white/72 after:scale-x-0 hover:text-white hover:after:scale-x-100" : "text-[var(--color-ink)]/68 after:scale-x-0 hover:text-[var(--color-ink)] hover:after:scale-x-100"}`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative font-[var(--font-sans)] text-[clamp(0.7rem,1vw,0.78rem)] font-semibold uppercase tracking-[0.12em] transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform after:duration-300 ${useTransparent ? isActive(item.href) ? "text-white after:scale-x-100" : "text-white/70 after:scale-x-0 hover:text-white hover:after:scale-x-100" : isActive(item.href) ? "text-[var(--color-ink)] after:scale-x-100" : "text-[var(--color-ink)]/68 after:scale-x-0 hover:text-[var(--color-ink)] hover:after:scale-x-100"}`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher transparent={useTransparent} />
            <JuryMenu transparent={useTransparent} />
          </div>

          <button
            type="button"
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className={`relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 lg:hidden ${useTransparent ? "border-white/30 bg-white/10 text-white backdrop-blur-md hover:border-white hover:bg-white hover:text-[var(--color-ink)]" : "border-black/10 bg-white text-[var(--color-ink)] shadow-[0_10px_24px_rgba(3,2,19,0.05)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white"}`}
          >
            <span className="sr-only">
              {open ? t.header.closeMenu : t.header.openMenu}
            </span>
            <span className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${open ? "rotate-45" : "-translate-y-1.5"}`} />
            <span className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${open ? "-rotate-45" : "translate-y-1.5"}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu — slides down from top, same pattern as IBPA-WEB */}
      <div
        className={`fixed inset-x-0 top-[68px] z-40 h-[calc(100dvh-68px)] border-t border-black/8 bg-white/96 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 lg:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            {navigation.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLinkClick}
                  className="rounded-[24px] border border-black/10 bg-white px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)] shadow-[0_12px_24px_rgba(3,2,19,0.04)] transition-all duration-300 hover:border-black/24 hover:bg-black hover:text-white"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`rounded-[24px] border px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] shadow-[0_12px_24px_rgba(3,2,19,0.04)] transition-all duration-300 ${isActive(item.href) ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-black/10 bg-white text-[var(--color-ink)] hover:border-black/24 hover:bg-black hover:text-white"}`}
                >
                  {item.label}
                </Link>
              )
            )}

          </div>

          <div className="rounded-[30px] border border-black/8 bg-[var(--surface-tint)] p-4">
            <JuryMenu mobile onNavigate={handleLinkClick} />
          </div>

          <div className="rounded-[30px] border border-black/8 bg-[var(--surface-tint)] p-4">
            <LanguageSwitcher mobile onSelect={handleLinkClick} />
          </div>
        </div>
      </div>
    </header>
  );
}
