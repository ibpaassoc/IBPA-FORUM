"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, X } from "lucide-react";
import { requestAdditionalInfoAction } from "@/features/admin/actions/jury.actions";
import { dashboardTextareaClass } from "@/shared/components/admin/DashboardUI";
import { formatAdminDate } from "@/features/admin/server/view-models";

export default function RequestAdditionalInfoPanel({
  applicationId,
  status,
  infoRequestDetails,
  infoRequestedAt,
  infoResubmittedAt,
}: {
  applicationId: string;
  status: string;
  infoRequestDetails?: string | null;
  infoRequestedAt?: Date | null;
  infoResubmittedAt?: Date | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (status === "ADDITIONAL_INFO_REQUIRED") {
    return (
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
          Info requested · {formatAdminDate(infoRequestedAt ?? null)}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-800">
          {infoRequestDetails}
        </p>
        <p className="mt-3 text-xs text-amber-600/80">
          Awaiting applicant response.
        </p>
        <div className="mt-3 border-t border-amber-200 pt-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900"
          >
            <MessageSquarePlus size={13} />
            Send a new request
          </button>
          {isOpen ? (
            <form action={requestAdditionalInfoAction} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="id" value={applicationId} />
              <textarea
                name="infoRequestDetails"
                rows={4}
                placeholder="Describe what additional information is needed…"
                required
                className={dashboardTextareaClass}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  <Send size={13} />
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--surface-tint)]"
                >
                  <X size={13} />
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    );
  }

  if (status === "PAID") return null;

  if (infoResubmittedAt) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Application updated by applicant · {formatAdminDate(infoResubmittedAt)}
        </p>
        {infoRequestDetails ? (
          <p className="mt-1 text-xs leading-5 text-emerald-700/80">
            Previous request: {infoRequestDetails.length > 120 ? `${infoRequestDetails.slice(0, 120)}…` : infoRequestDetails}
          </p>
        ) : null}
        <div className="mt-3 border-t border-emerald-200 pt-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <MessageSquarePlus size={13} />
            Request more information
          </button>
          {isOpen ? (
            <form action={requestAdditionalInfoAction} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="id" value={applicationId} />
              <textarea
                name="infoRequestDetails"
                rows={4}
                placeholder="Describe what additional information is needed…"
                required
                className={dashboardTextareaClass}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[var(--color-blue)] bg-[var(--color-blue)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-blue-soft)]"
                >
                  <Send size={13} />
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--surface-tint)]"
                >
                  <X size={13} />
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {isOpen ? (
        <div className="rounded-lg border border-[#7DC8EE] bg-[#EAF6FF]/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
            Request additional information
          </p>
          <p className="mt-1 text-xs leading-5 text-black/55">
            An email will be sent to the applicant with your request and a secure link to update their application.
          </p>
          <form action={requestAdditionalInfoAction} className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="id" value={applicationId} />
            <textarea
              name="infoRequestDetails"
              rows={5}
              placeholder="Describe what additional information or documents are needed. Be specific — the applicant will see this text in the email."
              required
              className={dashboardTextareaClass}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[var(--color-blue)] bg-[var(--color-blue)] px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-blue-soft)]"
              >
                <Send size={13} />
                Send Request
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--surface-tint)]"
              >
                <X size={13} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[#7DC8EE] bg-white px-3.5 py-2 text-sm font-semibold leading-none text-[#1673A5] transition hover:bg-[#EAF6FF]"
        >
          <MessageSquarePlus aria-hidden size={15} />
          Request Additional Info
        </button>
      )}
    </div>
  );
}
