"use client";

import { useFormStatus } from "react-dom";

export function TestSubmitButton({ idle, pending = "Working…", danger = false }: { idle: string; pending?: string; danger?: boolean }) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.1em] transition disabled:cursor-wait disabled:opacity-55 ${danger ? "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100" : "bg-[var(--color-blue)] text-white hover:bg-[#4d86ad]"}`}
    >
      {status.pending ? pending : idle}
    </button>
  );
}

