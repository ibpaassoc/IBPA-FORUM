"use client";

import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d8c27a] focus:bg-white/[0.07]";

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
        <label className="text-sm font-medium text-white">{label}</label>
        {required ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8c27a]">
            Required
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="mt-2 text-xs leading-5 text-white/45">{hint}</p> : null}
    </div>
  );
}
