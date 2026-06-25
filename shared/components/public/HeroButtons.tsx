"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

// ─── HeroPrimaryButton ────────────────────────────────────────────────────────
// Dark gradient pill for full-screen photo hero sections.
// Matches HomeHero primary button exactly.

const HERO_PRIMARY_CLASS =
  "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-[#050505] via-[#111111] to-[#050505] px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:border-[#7a98af]/60 hover:shadow-[0_20px_60px_rgba(122,152,175,0.2)]";

export function HeroPrimaryButton({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#7a98af]/10 opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
      <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9d9eb]/0 to-transparent transition-all duration-700 group-hover:inset-x-4 group-hover:via-[#b9d9eb]/70" />
      <span className="absolute inset-0 before:absolute before:left-[-130%] before:top-0 before:h-full before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-[#b9d9eb]/25 before:to-transparent before:transition-all before:duration-700 group-hover:before:left-[130%]" />
      <span className="relative z-10">{children}</span>
      <ArrowRight
        size={16}
        className="relative z-10 text-[#b9d9eb] transition-all duration-500 group-hover:translate-x-1 group-hover:text-white"
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={HERO_PRIMARY_CLASS}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={HERO_PRIMARY_CLASS}>
      {inner}
    </button>
  );
}

// ─── HeroSecondaryButton ──────────────────────────────────────────────────────
// White glass ghost for dark hero sections.
// Matches HomeHero secondary button exactly.

export function HeroSecondaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/45 bg-white/[0.09] px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.18)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:border-[#b9d9eb]/65 hover:bg-white/[0.14] hover:shadow-[0_18px_50px_rgba(122,152,175,0.18)]"
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/14 via-white/[0.03] to-[#7a98af]/15 opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
      <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9d9eb]/0 to-transparent transition-all duration-700 group-hover:inset-x-4 group-hover:via-[#b9d9eb]/80" />
      <span className="absolute inset-[1px] rounded-full border border-[#b9d9eb]/0 transition-colors duration-700 group-hover:border-[#b9d9eb]/20" />
      <span className="absolute inset-0 before:absolute before:left-[-140%] before:top-0 before:h-full before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-all before:duration-700 group-hover:before:left-[140%]" />
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
