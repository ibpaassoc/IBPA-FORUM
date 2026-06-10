"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/shared/components/layout/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import JuryMenu from "@/shared/components/layout/JuryMenu";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { language, t } = useLanguage();
  const pathname = usePathname();

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
    <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-[var(--border-default)] bg-white/95 px-[var(--page-gutter)] shadow-[var(--shadow-sm)] backdrop-blur-[16px]">
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
              className="h-10 w-auto max-w-42.5 object-contain sm:h-12 sm:max-w-none"
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
                  className="relative font-[var(--font-sans)] text-[clamp(0.7rem,1vw,0.8rem)] font-medium uppercase tracking-[0.1em] text-[var(--color-ink)] opacity-75 transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[var(--color-hover)] after:transition-transform after:duration-300 hover:text-[var(--color-hover)] hover:opacity-100 hover:after:scale-x-100"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative font-[var(--font-sans)] text-[clamp(0.7rem,1vw,0.8rem)] font-medium uppercase tracking-[0.1em] transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-[var(--color-hover)] after:transition-transform after:duration-300 ${
                    isActive(item.href)
                      ? "text-[var(--color-hover)] opacity-100 after:scale-x-100"
                      : "text-[var(--color-ink)] opacity-75 after:scale-x-0 hover:text-[var(--color-hover)] hover:opacity-100 hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            {/* <JuryMenu /> */}

            <Link href="/apply/jury" className="ibpa-button ibpa-button-primary">
              {t.common.applyAsJury}
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
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out lg:hidden ${
            open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-[var(--border-default)] py-[var(--space-md)] pb-[max(2rem,env(safe-area-inset-bottom))]">
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
                        className="rounded-[var(--radius-sm)] border border-transparent bg-[var(--color-mist)] px-[var(--space-md)] py-[var(--space-sm)] text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-ink)] transition hover:border-[var(--color-hover)] hover:text-[var(--color-hover)]"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`rounded-[var(--radius-sm)] border px-[var(--space-md)] py-[var(--space-sm)] text-sm font-medium uppercase tracking-[0.16em] transition ${
                          isActive(item.href)
                            ? "border-[var(--border-strong)] bg-[var(--surface-tint)] text-[var(--color-hover)]"
                            : "border-transparent bg-[var(--color-mist)] text-[var(--color-ink)] hover:border-[var(--color-hover)] hover:text-[var(--color-hover)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </div>

                <div className="grid gap-3 border-t border-[var(--border-default)] pt-[var(--space-md)]">
                  <LanguageSwitcher mobile />
                  {/* <JuryMenu mobile onNavigate={handleLinkClick} /> */}

                  <Link
                    href="/apply/jury"
                    onClick={handleLinkClick}
                    className="ibpa-button ibpa-button-primary"
                  >
                    {t.common.applyAsJury}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
