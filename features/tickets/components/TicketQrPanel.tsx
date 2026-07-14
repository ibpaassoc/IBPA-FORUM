"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Maximize2, X } from "lucide-react";

type WakeLockSentinelLike = {
  release: () => Promise<void>;
};

export default function TicketQrPanel({
  ticketId,
  fullName,
  qrDataUrl,
}: {
  ticketId: string;
  fullName: string;
  qrDataUrl: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    void (async () => {
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
        };
        wakeLockRef.current = nav.wakeLock ? await nav.wakeLock.request("screen") : null;
      } catch {
        wakeLockRef.current = null;
      }
    })();

    return () => {
      void wakeLockRef.current?.release().catch(() => undefined);
      wakeLockRef.current = null;
    };
  }, [open]);

  async function openFullscreen() {
    setOpen(true);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    try {
      await dialogRef.current?.requestFullscreen?.();
    } catch {
      // The full-viewport dialog remains available when Fullscreen API is denied.
    }
  }

  async function close() {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
    setOpen(false);
  }

  return (
    <div className="mt-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt={`QR code for ${fullName}`}
        className="w-full max-w-[220px] rounded-[18px] border border-[rgba(114,160,193,0.2)] bg-white p-3"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void openFullscreen()}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border-default)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)]"
        >
          <Maximize2 size={14} /> Open full screen
        </button>
        <a
          href={`/api/account/tickets/${ticketId}/qr`}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border-default)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)]"
        >
          <Download size={14} /> Download PNG
        </a>
      </div>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[400] flex min-h-dvh flex-col items-center justify-center bg-white p-5"
        >
          <button
            type="button"
            onClick={() => void close()}
            aria-label="Close full-screen QR"
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`QR code for ${fullName}`}
            className="h-auto w-[min(82vw,82vh,560px)] bg-white p-[min(6vw,44px)]"
          />
        </div>
      ) : null}
    </div>
  );
}
