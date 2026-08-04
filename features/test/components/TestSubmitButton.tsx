"use client";

import { useFormStatus } from "react-dom";

export function TestSubmitButton({ idle, pending = "Working…", danger = false }: { idle: string; pending?: string; danger?: boolean }) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-[0.7rem] font-semibold uppercase tracking-[0.11em] transition disabled:cursor-wait disabled:opacity-55 ${danger ? "border border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/15" : "border border-white bg-white text-zinc-950 shadow-[0_10px_28px_rgba(255,255,255,0.13)] hover:bg-zinc-200"}`}
    >
      {status.pending ? pending : idle}
    </button>
  );
}
