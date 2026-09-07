"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LockKeyhole } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import {
  ConfirmDialog,
  DashboardDangerBtn,
} from "@/shared/components/admin/DashboardUI";

export default function CloseScoringControl({ closed }: { closed: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function confirmClose() {
    if (busy || closed) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/scoring/close", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(payload?.message ?? adminT.scoring.closeError);
        return;
      }
      setOpen(false);
      startTransition(() => router.refresh());
    } catch {
      setError(adminT.scoring.closeError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DashboardDangerBtn
        type="button"
        disabled={closed || busy}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <LockKeyhole aria-hidden size={15} />
        {closed ? adminT.scoring.scoringClosed : adminT.scoring.closeScoring}
      </DashboardDangerBtn>
      <ConfirmDialog
        open={open}
        title={adminT.scoring.closeTitle}
        description={adminT.scoring.closeDescription}
        confirmLabel={busy ? adminT.scoring.closingScoring : adminT.scoring.closeConfirm}
        cancelLabel={adminT.common.cancel}
        busy={busy}
        error={error}
        onCancel={() => setOpen(false)}
        onConfirm={() => { void confirmClose(); }}
      />
    </>
  );
}
