"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import LanguageSwitcher from "@/shared/components/layout/LanguageSwitcher";
import JuryMenu from "@/shared/components/layout/JuryMenu";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const HERO_PAGES: string[] = ["/", "/jury", "/grand-prix", "/categories"];

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
      href: "/association",
      label: associationLabel,
      external:false
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

    const observer = new ResizeObserver(updateHeaderHeight);
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
      className={`fixed inset-x-0 top-0 z-[100] w-full border-b px-[var(--page-gutter)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        useTransparent
          ? "border-transparent bg-transparent py-5 lg:py-7"
          : "border-[#b9d9eb]/45 bg-white/76 py-3 shadow-[0_18px_50px_rgba(20,49,71,0.08)] backdrop-blur-2xl lg:py-4"
      }`}
    >
      <div className="mx-auto max-w-[var(--content-width)]">
        <div className="relative flex items-center gap-[var(--space-sm)]">
          <Link
            href="/"
            aria-label="IBPA home"
            onClick={handleLinkClick}
            className="group min-w-0 shrink"
          >
            <Image
              src={useTransparent ? "/logo1.png" : "/logo2.png"}
              alt="IBPA Logo"
              width={420}
              height={80}
              priority
              className="h-10 w-auto max-w-42.5 object-contain transition-all duration-700 group-hover:scale-[1.02] sm:h-12 sm:max-w-none"
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
                  className={`relative font-[var(--font-ui-family)] text-[clamp(0.7rem,1vw,0.78rem)] font-semibold uppercase tracking-[0.13em] transition-all duration-500 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform after:duration-500 ${
                    useTransparent
                      ? "text-white/74 after:scale-x-0 hover:text-white hover:after:scale-x-100"
                      : "text-[var(--color-ink)]/68 after:scale-x-0 hover:text-[var(--color-ink)] hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative font-[var(--font-ui-family)] text-[clamp(0.7rem,1vw,0.78rem)] font-semibold uppercase tracking-[0.13em] transition-all duration-500 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform after:duration-500 ${
                    useTransparent
                      ? isActive(item.href)
                        ? "text-white after:scale-x-100"
                        : "text-white/72 after:scale-x-0 hover:text-white hover:after:scale-x-100"
                      : isActive(item.href)
                        ? "text-[var(--color-blue)] after:scale-x-100"
                        : "text-[var(--color-ink)]/68 after:scale-x-0 hover:text-[var(--color-ink)] hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div
              className={`rounded-full transition-all duration-700 ${
                useTransparent
                  ? "shadow-[0_12px_34px_rgba(0,0,0,0.10)]"
                  : "shadow-[0_12px_34px_rgba(122,152,175,0.12)]"
              }`}
            >
              <LanguageSwitcher transparent={useTransparent} />
            </div>

            <div
              className={`rounded-full transition-all duration-700 ${
                useTransparent
                  ? "shadow-[0_12px_34px_rgba(0,0,0,0.12)]"
                  : "shadow-[0_12px_34px_rgba(114,160,193,0.18)]"
              }`}
            >
              <JuryMenu transparent={useTransparent} />
            </div>
          </div>

          <button
            type="button"
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className={`relative ml-auto flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-all duration-500 lg:hidden ${
              useTransparent
                ? "border-white/40 bg-white/12 text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)] backdrop-blur-xl hover:border-white/70 hover:bg-white/20"
                : "border-[#b9d9eb]/60 bg-white/70 text-[#24394b] shadow-[0_12px_30px_rgba(122,152,175,0.14)] backdrop-blur-xl hover:border-[#8eb6d3]/70 hover:bg-white"
            }`}
          >
            <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
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
      </div>

      <div
        className={`fixed inset-x-0 top-[68px] z-40 h-[calc(100dvh-68px)] border-t border-[#b9d9eb]/45 bg-white/82 p-6 shadow-[0_30px_90px_rgba(20,49,71,0.16)] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] lg:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-2">
            {navigation.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLinkClick}
                  className="rounded-[24px] border border-white/65 bg-white/56 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)] shadow-[0_12px_30px_rgba(122,152,175,0.09)] backdrop-blur-xl transition-all duration-300 hover:border-[#8eb6d3]/70 hover:bg-white/78"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`rounded-[24px] border px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] shadow-[0_12px_30px_rgba(122,152,175,0.09)] backdrop-blur-xl transition-all duration-300 ${
                    isActive(item.href)
                      ? "border-[#8eb6d3]/75 bg-white/78 text-[var(--color-ink)]"
                      : "border-white/65 bg-white/56 text-[var(--color-ink)] hover:border-[#8eb6d3]/70 hover:bg-white/78"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>

          <div className="rounded-[30px] border border-white/65 bg-white/50 p-4 shadow-[0_14px_34px_rgba(122,152,175,0.1)] backdrop-blur-2xl">
            <JuryMenu mobile onNavigate={handleLinkClick} />
          </div>

          <div className="rounded-[30px] border border-white/65 bg-white/50 p-4 shadow-[0_14px_34px_rgba(122,152,175,0.1)] backdrop-blur-2xl">
            <LanguageSwitcher mobile onSelect={handleLinkClick} />
          </div>
        </div>
      </div>
    </header>
  );
}
