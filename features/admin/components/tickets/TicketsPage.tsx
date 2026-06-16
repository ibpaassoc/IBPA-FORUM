"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Ticket, Camera, CheckCircle2, XCircle, AlertCircle, RefreshCw, X } from "lucide-react";
import {
  DashboardCard,
  DashboardMetricTile,
  DashboardBadge,
  DashboardEmptyState,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
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
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

// ── QR Scanner component ──────────────────────────────────────────────────────

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
      setState({ phase: "error", message: "Camera access denied. Please allow camera permissions and try again." });
    }
  }, []); // eslint-disable-line

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-[28px] bg-white p-6 sm:rounded-[28px]">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#10203B]">Scan Ticket QR</h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
            <X size={18} />
          </button>
        </div>

        {/* States */}
        {state.phase === "idle" && (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Camera size={32} className="mx-auto text-[#4C7D9D]" />
              <p className="mt-3 text-sm text-slate-500">Point camera at ticket QR code</p>
            </div>
            <div className="flex gap-2">
              <label className="flex-1">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4C7D9D]">Check-in type</span>
                <select
                  value={checkInType}
                  onChange={(e) => setCheckInType(e.target.value as "ONE_DAY" | "GALA_DINNER")}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#10203B] outline-none focus:border-[#4C7D9D]"
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
            <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-black">
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
              {/* Corner guides */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-48">
                  <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-white" />
                  <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-white" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-white" />
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500">Scanning for QR code…</p>
            <DashboardSecondaryBtn onClick={reset} className="w-full justify-center">Cancel</DashboardSecondaryBtn>
          </div>
        )}

        {state.phase === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <RefreshCw size={32} className="animate-spin text-[#4C7D9D]" />
            <p className="text-sm text-slate-500">Looking up ticket…</p>
          </div>
        )}

        {state.phase === "confirm" && (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4C7D9D]">Ticket holder</p>
              <p className="mt-2 text-base font-semibold text-[#10203B]">{state.ticket.fullName}</p>
              <p className="mt-0.5 text-sm text-slate-500">{state.ticket.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ticketStatusBadge(state.ticket.status)}
                {state.ticket.galaDinner && <DashboardBadge tone="purple">Gala dinner</DashboardBadge>}
              </div>
              {state.ticket.lastCheckIn && (
                <p className="mt-2 text-xs text-amber-600">⚠ Previously checked in: {formatDate(state.ticket.lastCheckIn)}</p>
              )}
            </div>
            <p className="text-sm text-slate-600">Check in as: <strong>{checkInType === "GALA_DINNER" ? "Gala dinner" : "Forum (1-day)"}</strong></p>
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TicketsPage({ tickets }: { tickets: TicketRecord[] }) {
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B] md:text-3xl">Tickets & Check-in</h1>
        </div>
        <DashboardPrimaryBtn onClick={() => setShowScanner(true)}>
          <Camera size={16} /> Scan QR
        </DashboardPrimaryBtn>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardMetricTile label="Total tickets" value={tickets.length} />
        <DashboardMetricTile label="Paid" value={paid.length} accent="blue" />
        <DashboardMetricTile label="Checked in" value={checkedIn.length} accent="green" />
        <DashboardMetricTile label="Pending payment" value={pending.length} accent="amber" />
      </div>

      {/* Table */}
      <DashboardCard className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 p-4 md:p-5">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-[#10203B] outline-none transition focus:border-[#4C7D9D] focus:ring-2 focus:ring-[#4C7D9D]/10"
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
          <div className="divide-y divide-slate-100">
            <div className="hidden grid-cols-[1.4fr_0.8fr_auto_auto_auto] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4C7D9D] lg:grid">
              <span>Attendee</span>
              <span>Type</span>
              <span>Gala</span>
              <span>Status</span>
              <span>Last check-in</span>
            </div>
            {filtered.map((ticket) => (
              <div
                key={ticket.id}
                className="grid gap-2 px-4 py-4 lg:grid-cols-[1.4fr_0.8fr_auto_auto_auto] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#10203B]">{ticket.fullName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{ticket.email}</p>
                  {ticket.isIbpaMember && (
                    <p className="text-[11px] text-[#4C7D9D] font-medium">IBPA Member</p>
                  )}
                </div>
                <p className="text-sm text-slate-600 capitalize">{ticket.type.replace("_", " ").toLowerCase()}</p>
                <div>{ticket.galaDinner ? <DashboardBadge tone="purple">Yes</DashboardBadge> : <span className="text-xs text-slate-400">No</span>}</div>
                <div>{ticketStatusBadge(ticket.status)}</div>
                <p className="text-xs text-slate-400">{formatDate(ticket.lastCheckIn)}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {showScanner && <QrScanner onClose={() => setShowScanner(false)} />}
    </div>
  );
}
