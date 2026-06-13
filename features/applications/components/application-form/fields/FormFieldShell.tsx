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
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--color-ink)]/60">
          {label}
        </label>
        {required ? (
          <span className="text-[0.85rem] font-medium text-[var(--color-hover-accent)]">*</span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p className="text-[0.72rem] leading-5 text-red-500">{error}</p>
      ) : description ? (
        <p className="text-[0.72rem] leading-5 text-[var(--color-ink)]/45">{description}</p>
      ) : null}
    </div>
  );
}
