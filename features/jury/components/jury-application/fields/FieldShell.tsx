"use client";

import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-navy)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]";

export default function FieldShell({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-(--color-navy)">{label}</label>
        {required ? (
          <span className="py-0.5 text-[1rem] font-medium uppercase tracking-widest text-(--color-hover)">
            *
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="mt-(--space-xs) text-xs leading-5 text-(--color-steel)">{hint}</p> : null}
    </div>
  );
}
