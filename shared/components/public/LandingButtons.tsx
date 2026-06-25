"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

// ─── ButtonLayers ─────────────────────────────────────────────────────────────
// Decorative inner layers for the glass pill button.
// Parent wrapper must have `group` class for the shimmer to fire.

export function ButtonLayers() {
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
      <span className="absolute inset-x-8 top-[1px] h-[45%] rounded-full bg-gradient-to-b from-white/80 to-transparent" />
      <span className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/70 to-transparent opacity-60" />
      <span className="absolute inset-[1px] rounded-full border border-white/60" />
    </>
  );
}

// ─── Base class ───────────────────────────────────────────────────────────────
// Exported for use with custom wrappers (e.g. BuyTicketsButton).

export const LANDING_PRIMARY_BTN_CLASS =
  "group relative inline-flex min-h-[56px] items-center justify-center gap-3 overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,252,255,0.72))] px-8 py-4 font-[var(--font-ui-family)] text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#24394b] backdrop-blur-[24px] shadow-[0_1px_0_rgba(255,255,255,0.95),0_10px_30px_rgba(122,152,175,0.10),0_20px_50px_rgba(122,152,175,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[#8eb6d3]/65 hover:shadow-[0_2px_0_rgba(255,255,255,1),0_14px_40px_rgba(122,152,175,0.14)]";

// ─── LandingPrimaryButton ─────────────────────────────────────────────────────
// White glass pill for use on white / blue-tint section backgrounds.
// Renders as <Link> when href is provided, otherwise <button>.

type LandingPrimaryButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  external?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
};

const DISABLED_BTN_CLASS = "cursor-not-allowed opacity-60 hover:translate-y-0 hover:scale-100";

export function LandingPrimaryButton({
  href,
  onClick,
  children,
  className,
  external,
  type = "button",
  disabled,
}: LandingPrimaryButtonProps) {
  const cls = clsx(LANDING_PRIMARY_BTN_CLASS, disabled && DISABLED_BTN_CLASS, className);

  const inner = (
    <>
      <ButtonLayers />
      <span className="relative z-10">{children}</span>
      <ArrowRight
        size={16}
        className="relative z-10 text-[#72a0c1] transition-all duration-200 group-hover:translate-x-0.5"
      />
    </>
  );

  if (href && !disabled) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={cls}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

// ─── LandingSecondaryButton ───────────────────────────────────────────────────
// Ghost glass for use alongside LandingPrimaryButton.
// Children are rendered verbatim — include icons in children if needed.

type LandingSecondaryButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  external?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
};

export const LANDING_SECONDARY_BTN_CLASS =
  "group relative inline-flex min-h-[56px] items-center justify-center gap-2 overflow-hidden rounded-full border border-[#b9d9eb]/60 bg-white/35 px-8 py-4 font-[var(--font-ui-family)] text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#24394b] backdrop-blur-xl shadow-[0_10px_30px_rgba(122,152,175,0.09)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[#8eb6d3]/70 hover:bg-white/55 hover:shadow-[0_14px_38px_rgba(122,152,175,0.13)]";

export function LandingSecondaryButton({
  href,
  onClick,
  children,
  className,
  external,
  type = "button",
  disabled,
}: LandingSecondaryButtonProps) {
  const cls = clsx(LANDING_SECONDARY_BTN_CLASS, disabled && DISABLED_BTN_CLASS, className);

  const inner = (
    <>
      <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (href && !disabled) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={cls}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}
