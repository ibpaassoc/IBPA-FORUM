"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function AdminReopenScoreButton({ scoreId }: { scoreId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleReopen() {
    setError(null);

    const response = await fetch("/api/admin/scoring/reopen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scoreId }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(payload?.message ?? "We could not reopen this score.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => { void handleReopen(); }}
        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#4C7D9D]/40 hover:text-[#10203B] disabled:cursor-not-allowed disabled:opacity-65"
      >
        Reopen Score
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
