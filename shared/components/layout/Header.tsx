"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/shared/components/layout/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import JuryMenu from "@/shared/components/layout/JuryMenu";

const HERO_PAGES = ["/"];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, t } = useLanguage();
  const pathname = usePathname();

  const isHeroPage = HERO_PAGES.includes(pathname);
  const useTransparent = isHeroPage && !scrolled;

  const associationLabel =
    language === "ru"
      ? "Ассоциация"
      : language === "ua"
        ? "Асоціація"
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
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLinkClick = () => setOpen(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] w-full px-[var(--page-gutter)] transition-all duration-500 ${
        useTransparent
          ? "bg-transparent"
          : "border-b border-[var(--border-default)] bg-white/96 shadow-[var(--shadow-sm)] backdrop-blur-[20px]"
      }`}
    >
      <div className="mx-auto max-w-[var(--content-width)]">
        <div className="relative flex h-[clamp(60px,8vh,72px)] items-center gap-[var(--space-sm)]">
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
              className={`h-10 w-auto max-w-42.5 object-contain sm:h-12 sm:max-w-none transition-all duration-500 ${
                useTransparent ? "[filter:brightness(0)_invert(1)]" : ""
              }`}
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
                  className={`relative font-[var(--font-sans)] text-[clamp(0.7rem,1vw,0.78rem)] font-semibold uppercase tracking-[0.12em] opacity-75 transition hover:opacity-100 ${
                    useTransparent
                      ? "text-white hover:text-white"
                      : "text-[var(--color-ink)] hover:text-[var(--color-hover-accent)]"
                  } after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative font-[var(--font-sans)] text-[clamp(0.7rem,1vw,0.78rem)] font-semibold uppercase tracking-[0.12em] transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform after:duration-300 ${
                    useTransparent
                      ? isActive(item.href)
                        ? "text-white opacity-100 after:scale-x-100"
                        : "text-white opacity-70 after:scale-x-0 hover:opacity-100 hover:after:scale-x-100"
                      : isActive(item.href)
                        ? "text-[var(--color-hover-accent)] opacity-100 after:scale-x-100"
                        : "text-[var(--color-ink)] opacity-70 after:scale-x-0 hover:text-[var(--color-hover-accent)] hover:opacity-100 hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher transparent={useTransparent} />
            <JuryMenu transparent={useTransparent} />
          </div>

          <button
            type="button"
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className={`relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition hover:scale-105 sm:h-11 sm:w-11 lg:hidden ${
              useTransparent
                ? "border-white/30 bg-white/10 text-white backdrop-blur-md"
                : "border-[var(--border-default)] bg-white text-[var(--color-ink)] shadow-[var(--shadow-sm)]"
            }`}
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
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out lg:hidden ${
            open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-[var(--border-default)] bg-white py-[var(--space-md)] pb-[max(2rem,env(safe-area-inset-bottom))]">
              <div className="space-y-4">
                <div className="grid gap-2">
                  {navigation.map((item) =>
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={handleLinkClick}
                        className="rounded-[var(--radius-sm)] border border-transparent bg-[var(--surface-muted)] px-[var(--space-md)] py-[var(--space-sm)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)] transition hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`rounded-[var(--radius-sm)] border px-[var(--space-md)] py-[var(--space-sm)] text-sm font-semibold uppercase tracking-[0.14em] transition ${
                          isActive(item.href)
                            ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                            : "border-transparent bg-[var(--surface-muted)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  )}

                  <Link
                    href="/apply"
                    onClick={handleLinkClick}
                    className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white"
                  >
                    {t.common.applyNow} <ArrowRight size={15} />
                  </Link>
                </div>

                <div className="grid gap-3 border-t border-[var(--border-default)] pt-[var(--space-md)]">
                  <LanguageSwitcher mobile />
                  <JuryMenu mobile onNavigate={handleLinkClick} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
