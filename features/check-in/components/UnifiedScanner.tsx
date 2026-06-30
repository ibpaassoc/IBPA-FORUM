"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Keyboard,
  RefreshCw,
  ScanLine,
  Ticket,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  DashboardBadge,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";
import type {
  CheckInScope,
  CheckInScopeState,
  NormalizedTicket,
  TicketKind,
} from "../types";

type ScanState =
  | { phase: "idle" }
  | { phase: "manual" }
  | { phase: "scanning" }
  | { phase: "loading" }
  | { phase: "result"; ticket: NormalizedTicket; notice?: string }
  | { phase: "error"; message: string };

const KIND_META: Record<TicketKind, { label: string; icon: typeof Ticket }> = {
  TICKET: { label: "Forum / Gala", icon: Ticket },
  PARTICIPANT: { label: "Participant", icon: UserCheck },
  JURY: { label: "Jury", icon: Users },
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function paymentTone(status: string) {
  return status === "PAID" ? "green" : status === "PENDING" ? "amber" : "red";
}

export default function UnifiedScanner({
  onAfterCheckIn,
}: {
  onAfterCheckIn?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [state, setState] = useState<ScanState>({ phase: "idle" });
  const [manualCode, setManualCode] = useState("");
  const [busyScope, setBusyScope] = useState<CheckInScope | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/admin/check-in/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ phase: "error", message: data.message ?? "Ticket could not be verified." });
        return;
      }
      setState({ phase: "result", ticket: data.ticket as NormalizedTicket });
    } catch {
      setState({ phase: "error", message: "Network error. Please try again." });
    }
  }, []);

  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      // @ts-expect-error BarcodeDetector is experimental and not yet in TS DOM libs
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      detector
        .detect(video)
        .then((barcodes: Array<{ rawValue: string }>) => {
          if (barcodes.length > 0) {
            stopCamera();
            verifyCode(barcodes[0].rawValue);
            return;
          }
          rafRef.current = requestAnimationFrame(scanLoop);
        })
        .catch(() => {
          rafRef.current = requestAnimationFrame(scanLoop);
        });
    } else {
      stopCamera();
      setState({
        phase: "error",
        message:
          "Live QR scanning isn't supported in this browser. Use “Enter code manually” instead.",
      });
    }
  }, [stopCamera, verifyCode]);

  const startCamera = useCallback(async () => {
    setState({ phase: "scanning" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        scanLoop();
      }
    } catch {
      setState({
        phase: "error",
        message: "Camera access denied. Allow camera permissions, or enter the code manually.",
      });
    }
  }, [scanLoop]);

  const reset = useCallback(() => {
    stopCamera();
    setManualCode("");
    setBusyScope(null);
    setState({ phase: "idle" });
  }, [stopCamera]);

  async function confirmCheckIn(ticket: NormalizedTicket, scope: CheckInScope) {
    setBusyScope(scope);
    try {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketKind: ticket.ticketKind,
          sourceRecordId: ticket.sourceRecordId,
          scope,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setState({
          phase: "result",
          ticket: data.ticket as NormalizedTicket,
          notice: "Checked in successfully.",
        });
        onAfterCheckIn?.();
        return;
      }

      if (data.code === "ALREADY_CHECKED_IN") {
        // Reflect the existing check-in time in the current view.
        const patchedScopes = ticket.scopes.map((s) =>
          s.scope === scope ? { ...s, checkedInAt: data.checkedInAt ?? s.checkedInAt } : s,
        );
        setState({
          phase: "result",
          ticket: { ...ticket, scopes: patchedScopes, checkInStatus: "CHECKED_IN" },
          notice: data.message ?? "Already checked in.",
        });
        return;
      }

      setState({ phase: "error", message: data.message ?? "Check-in failed." });
    } catch {
      setState({ phase: "error", message: "Network error. Check-in failed." });
    } finally {
      setBusyScope(null);
    }
  }

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-md">
      {state.phase === "idle" && (
        <div className="space-y-4">
          <div className="rounded-[24px] border border-dashed border-[rgba(114,160,193,0.3)] bg-white/62 p-8 text-center backdrop-blur-xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
              <ScanLine size={26} strokeWidth={1.6} />
            </div>
            <p className="mt-4 font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">
              Scan any IBPA ticket
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              Forum, gala dinner, participant, and jury tickets are detected automatically.
            </p>
          </div>
          <DashboardPrimaryBtn onClick={startCamera} className="w-full justify-center">
            <Camera size={16} /> Start camera
          </DashboardPrimaryBtn>
          <DashboardSecondaryBtn
            onClick={() => setState({ phase: "manual" })}
            className="w-full justify-center"
          >
            <Keyboard size={16} /> Enter code manually
          </DashboardSecondaryBtn>
        </div>
      )}

      {state.phase === "manual" && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const code = manualCode.trim();
            if (code) verifyCode(code);
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
              Ticket code
            </span>
            <input
              autoFocus
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="IBPA:TICKET:… or paste the code"
              className={dashboardInputClass}
            />
          </label>
          <DashboardPrimaryBtn type="submit" className="w-full justify-center">
            <ScanLine size={16} /> Verify ticket
          </DashboardPrimaryBtn>
          <DashboardSecondaryBtn onClick={reset} className="w-full justify-center">
            Cancel
          </DashboardSecondaryBtn>
        </form>
      )}

      {state.phase === "scanning" && (
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-[var(--color-ink)]">
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-52 w-52">
                <div className="absolute left-0 top-0 h-9 w-9 rounded-tl-xl border-l-2 border-t-2 border-white/90" />
                <div className="absolute right-0 top-0 h-9 w-9 rounded-tr-xl border-r-2 border-t-2 border-white/90" />
                <div className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-xl border-b-2 border-l-2 border-white/90" />
                <div className="absolute bottom-0 right-0 h-9 w-9 rounded-br-xl border-b-2 border-r-2 border-white/90" />
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-[var(--color-ink-soft)]">
            Point the camera at the ticket QR code…
          </p>
          <DashboardSecondaryBtn onClick={reset} className="w-full justify-center">
            Cancel
          </DashboardSecondaryBtn>
        </div>
      )}

      {state.phase === "loading" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <RefreshCw size={30} className="animate-spin text-[var(--color-blue)]" />
          <p className="text-sm text-[var(--color-ink-soft)]">Verifying ticket…</p>
        </div>
      )}

      {state.phase === "result" && (
        <ResultView
          ticket={state.ticket}
          notice={state.notice}
          busyScope={busyScope}
          onCheckIn={confirmCheckIn}
          onReset={reset}
        />
      )}

      {state.phase === "error" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-[24px] bg-red-50 p-7 text-center">
            <XCircle size={38} className="text-red-500" />
            <p className="text-sm font-semibold text-red-800">{state.message}</p>
          </div>
          <DashboardPrimaryBtn onClick={reset} className="w-full justify-center">
            Try again
          </DashboardPrimaryBtn>
        </div>
      )}
    </div>
  );
}

function ResultView({
  ticket,
  notice,
  busyScope,
  onCheckIn,
  onReset,
}: {
  ticket: NormalizedTicket;
  notice?: string;
  busyScope: CheckInScope | null;
  onCheckIn: (ticket: NormalizedTicket, scope: CheckInScope) => void;
  onReset: () => void;
}) {
  const KindIcon = KIND_META[ticket.ticketKind].icon;
  const justChecked = notice === "Checked in successfully.";

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className={`flex items-center gap-2.5 rounded-[18px] p-3.5 text-sm font-semibold ${
            justChecked
              ? "bg-emerald-50 text-emerald-800"
              : "bg-[rgba(114,160,193,0.12)] text-[#356f98]"
          }`}
        >
          {justChecked ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {notice}
        </div>
      )}

      <div className="rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/72 p-5 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold text-[var(--color-ink)]">{ticket.ownerName}</p>
            <p className="mt-0.5 truncate text-sm text-[var(--color-ink-soft)]">{ticket.email}</p>
            {ticket.phone && (
              <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">{ticket.phone}</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-blue-wash)] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#356f98]">
            <KindIcon size={13} /> {KIND_META[ticket.ticketKind].label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[rgba(37,42,45,0.08)] pt-4">
          <Field label="Ticket type" value={ticket.ticketType} />
          <Field
            label="Payment"
            value={<DashboardBadge tone={paymentTone(ticket.paymentStatus)}>{ticket.paymentStatus}</DashboardBadge>}
          />
        </div>
      </div>

      {!ticket.eligibleForCheckIn ? (
        <div className="flex items-center gap-2.5 rounded-[18px] bg-amber-50 p-3.5 text-sm font-medium text-amber-800">
          <AlertTriangle size={18} />
          Payment is not complete — this ticket can&apos;t be checked in yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {ticket.scopes.map((scope) => (
            <ScopeRow
              key={scope.scope}
              scope={scope}
              busy={busyScope === scope.scope}
              disabled={busyScope !== null}
              onCheckIn={() => onCheckIn(ticket, scope.scope)}
            />
          ))}
        </div>
      )}

      <DashboardPrimaryBtn onClick={onReset} className="w-full justify-center">
        <ScanLine size={16} /> Scan next ticket
      </DashboardPrimaryBtn>
    </div>
  );
}

function ScopeRow({
  scope,
  busy,
  disabled,
  onCheckIn,
}: {
  scope: CheckInScopeState;
  busy: boolean;
  disabled: boolean;
  onCheckIn: () => void;
}) {
  if (scope.checkedInAt) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-800">{scope.label}</p>
          <p className="text-xs text-emerald-700">Checked in · {formatDateTime(scope.checkedInAt)}</p>
        </div>
        <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-4 py-3">
      <p className="text-sm font-medium text-[var(--color-ink)]">{scope.label}</p>
      <DashboardPrimaryBtn onClick={onCheckIn} disabled={disabled} className="shrink-0">
        {busy ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
        Check in
      </DashboardPrimaryBtn>
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-[var(--color-ink)]">{value}</div>
    </div>
  );
}
