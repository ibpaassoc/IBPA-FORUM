"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, X } from "lucide-react";
import { requestAdditionalInfoAction } from "@/features/admin/actions/jury.actions";
import { adminT, formatAdminDate } from "@/lib/i18n/admin";
import { dashboardTextareaClass } from "@/shared/components/admin/DashboardUI";

function RequestForm({
  applicationId,
  placeholder,
  onClose,
  autoFocus = false,
}: {
  applicationId: string;
  placeholder: string;
  onClose: () => void;
  autoFocus?: boolean;
}) {
  return (
    <form action={requestAdditionalInfoAction} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="id" value={applicationId} />
      <textarea
        name="infoRequestDetails"
        rows={4}
        placeholder={placeholder}
        required
        className={dashboardTextareaClass}
        autoFocus={autoFocus}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-[18px] border border-[var(--color-blue)] bg-[var(--color-blue)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-hover-accent)]"
        >
          <Send size={13} />
          {adminT.infoRequest.send}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-[18px] border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--surface-tint)]"
        >
          <X size={13} />
          {adminT.common.cancel}
        </button>
      </div>
    </form>
  );
}

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
      <div className="mt-4 rounded-[22px] border border-[rgba(114,160,193,0.24)] bg-[rgba(114,160,193,0.1)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
          {adminT.infoRequest.requested} / {formatAdminDate(infoRequestedAt ?? null)}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-ink)]">
          {infoRequestDetails}
        </p>
        <p className="mt-3 text-xs text-[var(--color-blue)]/80">
          {adminT.infoRequest.awaitingResponse}
        </p>
        <div className="mt-3 border-t border-[rgba(114,160,193,0.24)] pt-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-blue)] transition hover:text-[var(--color-ink)]"
          >
            <MessageSquarePlus size={13} />
            {adminT.infoRequest.sendNew}
          </button>
          {isOpen ? (
            <RequestForm
              applicationId={applicationId}
              placeholder={adminT.infoRequest.placeholderShort}
              onClose={() => setIsOpen(false)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  if (status === "PAID") return null;

  if (infoResubmittedAt) {
    return (
      <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {adminT.infoRequest.updatedByApplicant} / {formatAdminDate(infoResubmittedAt)}
        </p>
        {infoRequestDetails ? (
          <p className="mt-1 text-xs leading-5 text-emerald-700/80">
            {adminT.infoRequest.previousRequest} {infoRequestDetails.length > 120 ? `${infoRequestDetails.slice(0, 120)}...` : infoRequestDetails}
          </p>
        ) : null}
        <div className="mt-3 border-t border-emerald-200 pt-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <MessageSquarePlus size={13} />
            {adminT.infoRequest.requestMore}
          </button>
          {isOpen ? (
            <RequestForm
              applicationId={applicationId}
              placeholder={adminT.infoRequest.placeholderShort}
              onClose={() => setIsOpen(false)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {isOpen ? (
        <div className="rounded-[22px] border border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)]/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
            {adminT.infoRequest.requestTitle}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">
            {adminT.infoRequest.requestText}
          </p>
          <RequestForm
            applicationId={applicationId}
            placeholder={adminT.infoRequest.placeholderLong}
            onClose={() => setIsOpen(false)}
            autoFocus
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[18px] border border-[rgba(114,160,193,0.34)] bg-white px-3.5 py-2 text-sm font-semibold leading-none text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)]"
        >
          <MessageSquarePlus aria-hidden size={15} />
          {adminT.infoRequest.button}
        </button>
      )}
    </div>
  );
}
