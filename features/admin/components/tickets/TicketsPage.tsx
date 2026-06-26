"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Ticket, Camera, CheckCircle2, XCircle, AlertCircle, RefreshCw, X, Tag } from "lucide-react";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardMetricTile,
  DashboardBadge,
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";

type TicketRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  type: string;
  galaDinner: boolean;
  isIbpaMember: boolean;
  status: string;
  lastCheckIn: Date | null;
  createdAt: Date;
};

function ticketStatusBadge(status: string) {
  switch (status) {
    case "PAID": return <DashboardBadge tone="blue">Paid</DashboardBadge>;
    case "CHECKED_ONE_DAY": return <DashboardBadge tone="green">Checked in</DashboardBadge>;
    case "CHECKED_TWO_DAY": return <DashboardBadge tone="green">Checked in</DashboardBadge>;
    case "CHECKED_GALA_DINNER": return <DashboardBadge tone="purple">Gala checked in</DashboardBadge>;
    case "PENDING": return <DashboardBadge tone="amber">Pending payment</DashboardBadge>;
    case "CANCELED": return <DashboardBadge tone="red">Canceled</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

function formatDate(date: Date | null | string) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

function EarlyBirdToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/early-bird", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnabled(data.enabled);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardCard>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-[18px] ${enabled ? "bg-[rgba(114,160,193,0.1)] text-[var(--color-blue)]" : "bg-white/62 text-[var(--color-ink-muted)]"}`}>
            <Tag size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">Early Bird Discount</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--color-ink)]">
              {enabled ? "Enabled - discounted prices shown to all visitors" : "Disabled - regular prices shown"}
            </p>
            {enabled && (
              <p className="mt-0.5 text-[11px] text-[var(--color-blue)]">
                The Stripe coupon is applied automatically on ticket checkout. Gala dinner is not discounted.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          aria-label={enabled ? "Disable early bird discount" : "Enable early bird discount"}
          className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
          style={{ backgroundColor: enabled ? "var(--color-blue)" : "rgba(37,42,45,0.16)" }}
        >
          <span
            className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{ transform: enabled ? "translateX(20px)" : "translateX(2px)" }}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-3 flex items-center gap-2 rounded-[18px] border border-[rgba(114,160,193,0.24)] bg-[rgba(114,160,193,0.1)] px-4 py-2.5">
          <AlertCircle size={14} className="shrink-0 text-[var(--color-blue)]" />
          <p className="text-[0.78rem] text-[var(--color-blue)]">
            Visitors see discounted ticket prices with the Early Bird label. Disable when the promotion ends.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}

type ScanState =
  | { phase: "idle" }
  | { phase: "scanning" }
  | { phase: "found"; token: string }
  | { phase: "loading"; token: string }
  | { phase: "confirm"; ticket: TicketInfo }
  | { phase: "success"; ticket: TicketInfo; checkInType: string }
  | { phase: "error"; message: string };

type TicketInfo = {
  id: string;
  fullName: string;
  email: string;
  type: string;
  galaDinner: boolean;
  status: string;
  lastCheckIn: string | null;
  token: string;
};

function QrScanner({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [state, setState] = useState<ScanState>({ phase: "idle" });
  const [checkInType, setCheckInType] = useState<"ONE_DAY" | "GALA_DINNER">("ONE_DAY");

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  function scanLoop() {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      // @ts-expect-error BarcodeDetector is experimental
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      detector.detect(video).then((barcodes: Array<{ rawValue: string }>) => {
        if (barcodes.length > 0) {
          const raw = barcodes[0].rawValue;
          const prefix = "IBPA-TICKET:";
          const token = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
          stopCamera();
          lookupTicket(token);
          return;
        }
        rafRef.current = requestAnimationFrame(scanLoop);
      }).catch(() => {
        rafRef.current = requestAnimationFrame(scanLoop);
      });
    } else {
      rafRef.current = requestAnimationFrame(scanLoop);
    }
  }

  async function lookupTicket(token: string) {
    setState({ phase: "loading", token });
    try {
      const res = await fetch(`/api/admin/tickets/${token}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState({ phase: "error", message: data.message ?? "Ticket not found." });
        return;
      }
      const { ticket } = await res.json();
      setState({ phase: "confirm", ticket: { ...ticket, token } });
    } catch {
      setState({ phase: "error", message: "Network error. Please try again." });
    }
  }

  async function startCamera() {
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
      setState({ phase: "error", message: "Camera access denied. Please allow camera permissions and try again." });
    }
  }

  async function confirmCheckIn(ticket: TicketInfo) {
    setState({ phase: "loading", token: ticket.token });
    try {
      const res = await fetch("/api/admin/tickets/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: ticket.token, checkInType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ phase: "error", message: data.message ?? "Check-in failed." });
        return;
      }
      setState({ phase: "success", ticket, checkInType });
    } catch {
      setState({ phase: "error", message: "Network error. Check-in failed." });
    }
  }

  function reset() {
    stopCamera();
    setState({ phase: "idle" });
  }

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(3,2,19,0.32)] backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-[28px] bg-white p-6 sm:rounded-[28px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">Scan Ticket QR</h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(37,42,45,0.08)] text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)]">
            <X size={18} />
          </button>
        </div>

        {state.phase === "idle" && (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-dashed border-[rgba(37,42,45,0.08)] bg-white/62 p-8 text-center">
              <Camera size={32} className="mx-auto text-[var(--color-blue)]" />
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">Point camera at ticket QR code</p>
            </div>
            <div className="flex gap-2">
              <label className="flex-1">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">Check-in type</span>
                <select
                  value={checkInType}
                  onChange={(e) => setCheckInType(e.target.value as "ONE_DAY" | "GALA_DINNER")}
                  className="h-10 w-full rounded-2xl border border-[rgba(37,42,45,0.08)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-blue)]"
                >
                  <option value="ONE_DAY">Forum (1-day)</option>
                  <option value="GALA_DINNER">Gala dinner</option>
                </select>
              </label>
            </div>
            <DashboardPrimaryBtn onClick={startCamera} className="w-full justify-center">
              <Camera size={16} /> Start camera
            </DashboardPrimaryBtn>
          </div>
        )}

        {state.phase === "scanning" && (
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[var(--color-ink)]">
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-48">
                  <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-white" />
                  <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-white" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-white" />
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-[var(--color-ink-soft)]">Scanning for QR code...</p>
            <DashboardSecondaryBtn onClick={reset} className="w-full justify-center">Cancel</DashboardSecondaryBtn>
          </div>
        )}

        {state.phase === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <RefreshCw size={32} className="animate-spin text-[var(--color-blue)]" />
            <p className="text-sm text-[var(--color-ink-soft)]">Looking up ticket...</p>
          </div>
        )}

        {state.phase === "confirm" && (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-blue)]">Ticket holder</p>
              <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">{state.ticket.fullName}</p>
              <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">{state.ticket.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ticketStatusBadge(state.ticket.status)}
                {state.ticket.galaDinner && <DashboardBadge tone="purple">Gala dinner</DashboardBadge>}
              </div>
              {state.ticket.lastCheckIn && (
                <p className="mt-2 text-xs text-[var(--color-blue)]">Previously checked in: {formatDate(state.ticket.lastCheckIn)}</p>
              )}
            </div>
            <p className="text-sm text-[var(--color-ink-soft)]">Check in as: <strong>{checkInType === "GALA_DINNER" ? "Gala dinner" : "Forum (1-day)"}</strong></p>
            <div className="flex gap-2">
              <DashboardSecondaryBtn onClick={reset} className="flex-1 justify-center">Cancel</DashboardSecondaryBtn>
              <DashboardPrimaryBtn onClick={() => confirmCheckIn(state.ticket)} className="flex-1 justify-center">
                <CheckCircle2 size={16} /> Confirm
              </DashboardPrimaryBtn>
            </div>
          </div>
        )}

        {state.phase === "success" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-[20px] bg-emerald-50 p-6 text-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
              <p className="text-base font-semibold text-emerald-800">Checked in!</p>
              <p className="text-sm text-emerald-700">{state.ticket.fullName}</p>
            </div>
            <DashboardPrimaryBtn onClick={reset} className="w-full justify-center">
              <Camera size={16} /> Scan next ticket
            </DashboardPrimaryBtn>
          </div>
        )}

        {state.phase === "error" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-[20px] bg-red-50 p-6 text-center">
              <XCircle size={36} className="text-red-500" />
              <p className="text-sm font-semibold text-red-800">{state.message}</p>
            </div>
            <DashboardPrimaryBtn onClick={reset} className="w-full justify-center">Try again</DashboardPrimaryBtn>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TicketsPage({
  tickets,
  initialEarlyBirdEnabled,
}: {
  tickets: TicketRecord[];
  initialEarlyBirdEnabled: boolean;
}) {
  const [showScanner, setShowScanner] = useState(false);
  const [search, setSearch] = useState("");

  const paid = tickets.filter((t) => t.status !== "PENDING" && t.status !== "CANCELED");
  const checkedIn = tickets.filter((t) => t.status.startsWith("CHECKED"));
  const pending = tickets.filter((t) => t.status === "PENDING");

  const filtered = tickets.filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Tickets"
        title="Check-in desk"
        description="Search attendees, monitor ticket status, and scan QR codes."
        actions={
          <DashboardPrimaryBtn onClick={() => setShowScanner(true)}>
            <Camera size={16} />
            Scan QR
          </DashboardPrimaryBtn>
        }
      />

      <EarlyBirdToggle initialEnabled={initialEarlyBirdEnabled} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Total tickets
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{tickets.length}</p>
        </DashboardAccentBlock>
        <DashboardMetricTile label="Paid" value={paid.length} accent="blue" />
        <DashboardMetricTile label="Checked in" value={checkedIn.length} accent="green" />
        <DashboardMetricTile label="Pending payment" value={pending.length} accent="amber" />
      </div>

      <DashboardCard className="overflow-hidden p-0">
        <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={dashboardInputClass}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <DashboardEmptyState
              icon={<Ticket size={22} />}
              title={search ? "No tickets match your search" : "No tickets yet"}
              description={search ? "Try a different name or email." : "Tickets will appear here after purchase."}
            />
          </div>
        ) : (
          <div className="divide-y divide-[rgba(37,42,45,0.08)]">
            <div className="hidden grid-cols-[1.4fr_0.8fr_auto_auto_auto] gap-3 border-b border-[rgba(37,42,45,0.08)] bg-white/62 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:grid">
              <span>Attendee</span>
              <span>Type</span>
              <span>Gala</span>
              <span>Status</span>
              <span>Last check-in</span>
            </div>
            {filtered.map((ticket) => (
              <div
                key={ticket.id}
                className="mx-3 my-3 grid gap-3 rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/62 p-4 shadow-[0_10px_26px_rgba(37,42,45,0.035)] lg:m-0 lg:grid-cols-[1.4fr_0.8fr_auto_auto_auto] lg:items-center lg:rounded-none lg:border-0 lg:bg-transparent lg:px-4 lg:py-4 lg:shadow-none"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">{ticket.fullName}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{ticket.email}</p>
                  {ticket.isIbpaMember && (
                    <p className="text-[11px] font-semibold text-[var(--color-blue)]">IBPA Member</p>
                  )}
                </div>
                <p className="text-sm capitalize text-[var(--color-ink-soft)]">{ticket.type.replace("_", " ").toLowerCase()}</p>
                <div>{ticket.galaDinner ? <DashboardBadge tone="purple">Yes</DashboardBadge> : <span className="text-xs text-[var(--color-ink-muted)]">No</span>}</div>
                <div>{ticketStatusBadge(ticket.status)}</div>
                <p className="text-xs text-[var(--color-ink-muted)]">{formatDate(ticket.lastCheckIn)}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {showScanner && <QrScanner onClose={() => setShowScanner(false)} />}
    </div>
  );
}
