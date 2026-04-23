import type { ReactNode } from "react";

export default function FormFieldShell({
  label,
  required,
  description,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-white">{label}</label>
        {required ? (
          <span className="rounded-full border border-[#d8c27a]/30 bg-[#d8c27a]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8c27a]">
            Required
          </span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p className="text-xs leading-5 text-[#f5aaaa]">{error}</p>
      ) : description ? (
        <p className="text-xs leading-5 text-white/45">{description}</p>
      ) : null}
    </div>
  );
}
