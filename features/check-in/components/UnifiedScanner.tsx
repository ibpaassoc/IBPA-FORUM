"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import jsQR from "jsqr";
import {
  AlertTriangle,
  CalendarDays,
  Camera,
  CheckCircle2,
  Keyboard,
  RefreshCw,
  ScanLine,
  Sun,
  Ticket,
  UserCheck,
  Users,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import {
  DashboardBadge,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";
import { scanModeScope } from "../scan-mode";
import { SCAN_MODES } from "../types";
import type {
  CheckInScope,
  CheckInScopeState,
  NormalizedTicket,
  ScanMode,
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
  TICKET: { label: adminT.scanner.kindForumGala, icon: Ticket },
  PARTICIPANT: { label: adminT.scanner.kindParticipant, icon: UserCheck },
  JURY: { label: adminT.scanner.kindJury, icon: Users },
};

const MODE_META: Record<ScanMode, { label: string; icon: typeof Ticket }> = {
  one_day: { label: adminT.scanner.modes.one_day, icon: Sun },
  two_day: { label: adminT.scanner.modes.two_day, icon: CalendarDays },
  gala_dinner: { label: adminT.scanner.modes.gala_dinner, icon: UtensilsCrossed },
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const scanLoopRef = useRef<() => void>(() => {});
  const [state, setState] = useState<ScanState>({ phase: "idle" });
  const [manualCode, setManualCode] = useState("");
  const [busyScope, setBusyScope] = useState<CheckInScope | null>(null);
  // Selected access mode; set once at the entrance and kept across scans.
  const [mode, setMode] = useState<ScanMode>("one_day");
  // Latest mode for the scan loop / async callbacks without re-creating them.
  const modeRef = useRef<ScanMode>(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

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
        body: JSON.stringify({ code, mode: modeRef.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ phase: "error", message: data.message ?? adminT.scanner.verifyFailed });
        return;
      }
      setState({ phase: "result", ticket: data.ticket as NormalizedTicket });
    } catch {
      setState({ phase: "error", message: adminT.scanner.networkError });
    }
  }, []);

  // Decode the current video frame with jsQR (canvas pixels). Pure-JS fallback
  // that works in every browser, including those without BarcodeDetector
  // (Firefox, most desktop Chrome on Windows).
  const decodeWithJsQR = useCallback((video: HTMLVideoElement): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(image.data, image.width, image.height, {
      inversionAttempts: "dontInvert",
    });
    return result?.data ?? null;
  }, []);

  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoopRef.current);
      return;
    }

    const hasBarcodeDetector =
      typeof window !== "undefined" && "BarcodeDetector" in window;

    if (hasBarcodeDetector) {
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
          rafRef.current = requestAnimationFrame(scanLoopRef.current);
        })
        .catch(() => {
          rafRef.current = requestAnimationFrame(scanLoopRef.current);
        });
      return;
    }

    const decoded = decodeWithJsQR(video);
    if (decoded) {
      stopCamera();
      verifyCode(decoded);
      return;
    }
    rafRef.current = requestAnimationFrame(scanLoopRef.current);
  }, [decodeWithJsQR, stopCamera, verifyCode]);

  // Keep the ref pointing at the latest scanLoop so the rAF recursion always
  // calls the current closure without scanLoop referencing itself.
  useEffect(() => {
    scanLoopRef.current = scanLoop;
  }, [scanLoop]);

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
        message: adminT.scanner.cameraError,
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
          // Forum tickets carry the selected mode so the server re-validates
          // and records the correct scope; participant/jury are not gated.
          ...(ticket.ticketKind === "TICKET" ? { mode } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setState({
          phase: "result",
          ticket: data.ticket as NormalizedTicket,
          notice: adminT.scanner.checkedInNotice,
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
          notice: data.message ?? adminT.scanner.alreadyCheckedIn,
        });
        return;
      }

      setState({ phase: "error", message: data.message ?? adminT.scanner.checkInFailed });
    } catch {
      setState({ phase: "error", message: adminT.scanner.networkError });
    } finally {
      setBusyScope(null);
    }
  }

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-md">
      <ModeSelector mode={mode} onChange={setMode} />

      {state.phase === "idle" && (
        <div className="space-y-4">
          <div className="rounded-[24px] border border-dashed border-[rgba(114,160,193,0.3)] bg-white/62 p-8 text-center backdrop-blur-xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
              <ScanLine size={26} strokeWidth={1.6} />
            </div>
            <p className="mt-4 font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">
              {adminT.scanner.idleTitle}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              {adminT.scanner.idleText}
            </p>
          </div>
          <DashboardPrimaryBtn onClick={startCamera} className="w-full justify-center">
            <Camera size={16} /> {adminT.scanner.startCamera}
          </DashboardPrimaryBtn>
          <DashboardSecondaryBtn
            onClick={() => setState({ phase: "manual" })}
            className="w-full justify-center"
          >
            <Keyboard size={16} /> {adminT.scanner.enterManually}
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
              {adminT.scanner.ticketCode}
            </span>
            <input
              autoFocus
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder={adminT.scanner.codePlaceholder}
              className={dashboardInputClass}
            />
          </label>
          <DashboardPrimaryBtn type="submit" className="w-full justify-center">
            <ScanLine size={16} /> {adminT.scanner.verifyTicket}
          </DashboardPrimaryBtn>
          <DashboardSecondaryBtn onClick={reset} className="w-full justify-center">
            {adminT.common.cancel}
          </DashboardSecondaryBtn>
        </form>
      )}

      {state.phase === "scanning" && (
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-[var(--color-ink)]">
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
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
            {adminT.scanner.pointCamera}
          </p>
          <DashboardSecondaryBtn onClick={reset} className="w-full justify-center">
            {adminT.common.cancel}
          </DashboardSecondaryBtn>
        </div>
      )}

      {state.phase === "loading" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <RefreshCw size={30} className="animate-spin text-[var(--color-blue)]" />
          <p className="text-sm text-[var(--color-ink-soft)]">{adminT.scanner.verifying}</p>
        </div>
      )}

      {state.phase === "result" && (
        <ResultView
          ticket={state.ticket}
          mode={mode}
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
            {adminT.common.tryAgain}
          </DashboardPrimaryBtn>
        </div>
      )}
    </div>
  );
}

function ResultView({
  ticket,
  mode,
  notice,
  busyScope,
  onCheckIn,
  onReset,
}: {
  ticket: NormalizedTicket;
  mode: ScanMode;
  notice?: string;
  busyScope: CheckInScope | null;
  onCheckIn: (ticket: NormalizedTicket, scope: CheckInScope) => void;
  onReset: () => void;
}) {
  const KindIcon = KIND_META[ticket.ticketKind].icon;
  const justChecked = notice === adminT.scanner.checkedInNotice;

  // Forum tickets are gated by the selected mode, so only surface the check-in
  // action for that mode's scope. Participant/jury records aren't day-typed —
  // show their single attendance scope unchanged.
  const actionableScopes =
    ticket.ticketKind === "TICKET"
      ? ticket.scopes.filter((s) => s.scope === scanModeScope(mode))
      : ticket.scopes;

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
          <Field label={adminT.scanner.ticketType} value={ticket.ticketType} />
          <Field
            label={adminT.scanner.payment}
            value={
              <DashboardBadge tone={paymentTone(ticket.paymentStatus)}>
                {adminT.statuses[ticket.paymentStatus] ?? ticket.paymentStatus}
              </DashboardBadge>
            }
          />
        </div>
      </div>

      {!ticket.eligibleForCheckIn ? (
        <div className="flex items-center gap-2.5 rounded-[18px] bg-amber-50 p-3.5 text-sm font-medium text-amber-800">
          <AlertTriangle size={18} />
          {adminT.scanner.notEligible}
        </div>
      ) : (
        <div className="space-y-2.5">
          {actionableScopes.map((scope) => (
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
        <ScanLine size={16} /> {adminT.scanner.scanNext}
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
          <p className="text-xs text-emerald-700">{adminT.scanner.checkedInAt} {formatDateTime(scope.checkedInAt)}</p>
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
        {adminT.scanner.checkInButton}
      </DashboardPrimaryBtn>
    </div>
  );
}

function ModeSelector({
  mode,
  onChange,
}: {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
        {adminT.scanner.modeSelectLabel}
      </p>
      <div
        role="radiogroup"
        aria-label={adminT.scanner.modeSelectLabel}
        className="grid grid-cols-3 gap-2 rounded-[20px] border border-[rgba(114,160,193,0.24)] bg-white/62 p-1.5 backdrop-blur-xl"
      >
        {SCAN_MODES.map((value) => {
          const meta = MODE_META[value];
          const Icon = meta.icon;
          const active = value === mode;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(value)}
              className={`flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-[15px] px-2 py-2.5 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(114,160,193,0.55)] ${
                active
                  ? "bg-[var(--color-blue)] text-white shadow-[0_10px_24px_rgba(114,160,193,0.35)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)]/70 active:bg-[var(--color-blue-wash)]"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.6} />
              <span className="text-[0.78rem] font-semibold leading-tight">{meta.label}</span>
            </button>
          );
        })}
      </div>
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
