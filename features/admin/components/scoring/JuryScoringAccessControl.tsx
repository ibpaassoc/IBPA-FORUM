"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import {
  ConfirmDialog,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

export default function JuryScoringAccessControl({
  juryId,
  juryName,
  manuallyOpened,
}: {
  juryId: string;
  juryName: string;
  manuallyOpened: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const nextOpen = !manuallyOpened;

  async function confirmToggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/scoring/jury-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juryId, open: nextOpen }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(payload?.message ?? adminT.scoring.juryAccessError);
        return;
      }
      setOpen(false);
      startTransition(() => router.refresh());
    } catch {
      setError(adminT.scoring.juryAccessError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <DashboardSecondaryBtn
        type="button"
        disabled={busy}
        aria-label={`${nextOpen ? adminT.scoring.juryAccessOpenAction : adminT.scoring.juryAccessCloseAction} — ${juryName}`}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        {nextOpen ? <LockKeyholeOpen aria-hidden size={14} /> : <LockKeyhole aria-hidden size={14} />}
        {nextOpen ? adminT.scoring.juryAccessOpenAction : adminT.scoring.juryAccessCloseAction}
      </DashboardSecondaryBtn>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <ConfirmDialog
        open={open}
        title={nextOpen ? adminT.scoring.juryAccessOpenTitle : adminT.scoring.juryAccessCloseTitle}
        description={`${juryName} — ${nextOpen ? adminT.scoring.juryAccessOpenDescription : adminT.scoring.juryAccessCloseDescription}`}
        confirmLabel={busy
          ? adminT.scoring.juryAccessBusy
          : nextOpen
            ? adminT.scoring.juryAccessOpenConfirm
            : adminT.scoring.juryAccessCloseConfirm}
        cancelLabel={adminT.common.cancel}
        busy={busy}
        error={error}
        onCancel={() => setOpen(false)}
        onConfirm={() => { void confirmToggle(); }}
      />
    </div>
  );
}
