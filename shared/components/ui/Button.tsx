"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "blue" | "ghost" | "soft" | "white";
export type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
};

type ButtonAsButton = BaseProps & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

type ButtonAsLink = BaseProps & {
  href: string;
  external?: boolean;
  onClick?: () => void;
  type?: undefined;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-5 py-2 text-[0.68rem] tracking-[0.1em]",
  md: "min-h-[44px] px-[clamp(1.4rem,2.5vw,2.2rem)] py-[clamp(0.6rem,1.2vw,0.72rem)] text-[clamp(0.72rem,1vw,0.8rem)] tracking-[0.1em]",
  lg: "min-h-[52px] px-10 py-3.5 text-[0.82rem] tracking-[0.1em]",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "ibpa-button-primary",
  blue: "ibpa-button-blue",
  ghost: "ibpa-button-ghost",
  soft: "ibpa-button-soft",
  white: "ibpa-button-white",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const cls = clsx(
    "ibpa-button",
    variantClasses[variant],
    sizeClasses[size],
    disabled && "pointer-events-none opacity-50",
    className,
  );

  if ("href" in props && props.href !== undefined) {
    const { href, external, onClick } = props;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={onClick}
          className={cls}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} onClick={onClick} className={cls}>
        {children}
      </Link>
    );
  }

  const { onClick, type = "button" } = props as ButtonAsButton;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
    >
      {children}
    </button>
  );
}
