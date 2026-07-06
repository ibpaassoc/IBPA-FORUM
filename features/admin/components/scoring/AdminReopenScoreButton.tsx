"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminT } from "@/lib/i18n/admin";
import { DashboardSecondaryBtn } from "@/shared/components/admin/DashboardUI";

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
      setError(payload?.message ?? adminT.scoring.reopenError);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <DashboardSecondaryBtn
        type="button"
        disabled={isPending}
        onClick={() => { void handleReopen(); }}
      >
        {adminT.scoring.reopenScore}
      </DashboardSecondaryBtn>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
