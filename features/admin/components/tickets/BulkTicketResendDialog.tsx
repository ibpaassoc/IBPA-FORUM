"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, MailCheck, X } from "lucide-react";
import type { BulkTicketResendResult } from "@/features/tickets/lib/bulk-resend";
import { adminT } from "@/lib/i18n/admin";
import {
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

type Props = {
  open: boolean;
  eligibleCount: number;
  onClose: () => void;
  onComplete: (result: BulkTicketResendResult) => void;
};

type RequestState = "idle" | "sending" | "uncertain";

export default function BulkTicketResendDialog({
  open,
  eligibleCount,
  onClose,
  onComplete,
}: Props) {
  const copy = adminT.tickets.bulkResend;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const sendingRef = useRef(false);
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sending = requestState === "sending";

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const portalRoot = dialogRef.current?.parentElement;
    const backgroundElements = Array.from(document.body.children)
      .filter((element): element is HTMLElement =>
        element instanceof HTMLElement && element !== portalRoot
      )
      .map((element) => ({
        element,
        inert: element.inert,
        ariaHidden: element.getAttribute("aria-hidden"),
      }));

    for (const { element } of backgroundElements) {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "hidden";
    dialogRef.current
      ?.querySelector<HTMLElement>('[data-dialog-initial-focus="true"]')
      ?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !sendingRef.current) {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      for (const { element, inert, ariaHidden } of backgroundElements) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  function close() {
    if (sending) return;
    setRequestState("idle");
    setRunId(null);
    setError(null);
    onClose();
  }

  async function submit() {
    if (sending || eligibleCount === 0) return;
    const activeRunId = runId ?? crypto.randomUUID();
    setRunId(activeRunId);
    setRequestState("sending");
    setError(null);

    try {
      const response = await fetch("/api/admin/tickets/resend-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: activeRunId }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        result?: BulkTicketResendResult;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.result) {
        setRequestState("idle");
        setError(data.message ?? copy.requestFailed);
        return;
      }

      onComplete(data.result);
      setRequestState("idle");
      setRunId(null);
      setError(null);
      onClose();
    } catch {
      // The server may have accepted the request before the connection failed.
      // Keep the same run ID so Resend idempotency makes the retry safe.
      setRequestState("uncertain");
      setError(copy.uncertainResult);
    }
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-[rgba(5,22,43,0.68)] p-2 backdrop-blur-[6px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulk-ticket-resend-title"
        aria-describedby="bulk-ticket-resend-description"
        aria-busy={sending}
        className="relative w-full max-w-xl rounded-[28px] border border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,0.99),rgba(238,248,253,0.97))] p-5 shadow-[0_40px_110px_rgba(3,18,38,0.38)] sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          disabled={sending}
          aria-label={copy.close}
          className="absolute right-4 top-4 inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-[rgba(114,160,193,0.3)] bg-white/80 text-[#35536a] transition hover:border-[var(--color-blue)] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-blue)]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X aria-hidden size={18} />
        </button>

        <div className="flex items-start gap-3 pr-12">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px] bg-amber-50 text-amber-700">
            <AlertTriangle aria-hidden size={20} />
          </span>
          <div>
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
              {copy.eyebrow}
            </p>
            <h2
              id="bulk-ticket-resend-title"
              className="mt-1 font-[var(--font-title-family)] text-[1.9rem] font-light leading-tight tracking-[-0.03em] text-[var(--color-ink)]"
            >
              {copy.title}
            </h2>
          </div>
        </div>

        <div
          id="bulk-ticket-resend-description"
          className="mt-5 space-y-3 text-sm leading-6 text-[var(--color-ink-soft)]"
        >
          <p>{copy.description(eligibleCount)}</p>
          <p>{copy.scope}</p>
          <p>{copy.delivery}</p>
        </div>

        {error ? (
          <div role="alert" className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DashboardSecondaryBtn
            type="button"
            onClick={close}
            disabled={sending}
            dialogInitialFocus
          >
            {copy.cancel}
          </DashboardSecondaryBtn>
          <DashboardPrimaryBtn
            type="button"
            onClick={() => void submit()}
            disabled={sending || eligibleCount === 0}
            className="min-w-52"
          >
            {sending ? (
              <>
                <Loader2 aria-hidden className="animate-spin" size={16} />
                {copy.sending}
              </>
            ) : (
              <>
                <MailCheck aria-hidden size={16} />
                {requestState === "uncertain" ? copy.retry : copy.confirm(eligibleCount)}
              </>
            )}
          </DashboardPrimaryBtn>
        </div>
      </div>
    </div>,
    document.body,
  );
}
