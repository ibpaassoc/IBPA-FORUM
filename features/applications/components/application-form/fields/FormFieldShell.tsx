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
        <label className="text-[clamp(0.68rem,1vw,0.78rem)] font-medium uppercase tracking-[0.08em] text-(--color-ink)">{label}</label>
        {required ? (
          <span className="py-0.5 text-[1rem] font-medium uppercase tracking-widest text-(--color-hover)">
            *
          </span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p className="text-xs leading-5 text-(--color-hover)">{error}</p>
      ) : description ? (
        <p className="text-xs leading-5 text-(--color-ink-soft)">{description}</p>
      ) : null}
    </div>
  );
}
