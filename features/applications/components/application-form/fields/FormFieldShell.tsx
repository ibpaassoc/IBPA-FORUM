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
        <label className="text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-[var(--color-navy)]">{label}</label>
        {required ? (
          <span className="rounded-[20px] bg-[rgba(201,169,110,0.15)] px-[7px] py-[2px] text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[var(--color-gold)]">
            Required
          </span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p className="text-xs leading-5 text-[var(--color-gold)]">{error}</p>
      ) : description ? (
        <p className="text-xs leading-5 text-[var(--color-steel)]">{description}</p>
      ) : null}
    </div>
  );
}
