"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ticket, Camera, X, ChevronDown, Send, Pencil, QrCode, RefreshCw, Mail, Loader2, Save, PackageOpen, CalendarClock, CreditCard, AlertTriangle, Trash2 } from "lucide-react";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardMetricTile,
  DashboardBadge,
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardPrimaryBtn,
  DashboardDangerBtn,
  IconButton,
  SearchBar,
} from "@/shared/components/admin/DashboardUI";
import { instagramProfileUrl } from "@/features/tickets/lib/instagram";
import { splitTicketTotalIntoTwoPayments } from "@/features/tickets/lib/payment-plan";
import { ticketCanBeDeleted } from "@/features/tickets/lib/admin-ticket-rules";
import { adminT } from "@/lib/i18n/admin";
import UnifiedScanner from "@/features/check-in/components/UnifiedScanner";

type TicketPayment = {
  amount: number;
  currency: string;
  status: string;
  paymentPlan: string;
  nextPaymentAt: Date | string | null;
  lastPaymentError: string | null;
  lastPaymentFailedAt: Date | string | null;
};

type TicketQrCredential = {
  id: string;
  status: string;
  generatedAt: Date | string;
  replacedAt: Date | string | null;
  revokedAt: Date | string | null;
  lastSentAt: Date | string | null;
  lastDeliveryStatus: string | null;
  lastDeliveryError: string | null;
};

type TicketRecord = {
  id: string;
  secureToken?: string;
  fullName: string;
  email: string;
  phone: string;
  instagram: string | null;
  type: string;
  origin: "STANDARD" | "SPECIAL_PACKET" | "JURY_GALA" | "SPECIAL_OFFER";
  galaDinner: boolean;
  isIbpaMember: boolean;
  status: string;
  paidAt: Date | string | null;
  lastCheckIn: Date | string | null;
  forumCheckInAt: Date | string | null;
  dayOneCheckInAt: Date | string | null;
  dayTwoCheckInAt: Date | string | null;
  galaCheckInAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  payments: TicketPayment[];
  qrCredentials: TicketQrCredential[];
};

type TicketFormState = {
  fullName: string;
  email: string;
  phone: string;
  instagram: string;
  type: "ONE_DAY" | "TWO_DAYS";
  galaDinner: boolean;
};

type ToastState = { tone: "success" | "error" | "info"; message: string } | null;

type QrPreview = {
  ticket: TicketRecord;
  credential: TicketQrCredential | null;
  qrDataUrl: string | null;
};

const ticketAdminCopy = adminT.tickets.admin;

function qrStatusLabel(status?: string | null) {
  if (!status) return ticketAdminCopy.unavailable;
  return ticketAdminCopy.qrStatuses[status] ?? status;
}

function ticketStatusBadge(status: string, paymentStatus?: string) {
  if (paymentStatus === "PARTIALLY_PAID") {
    return <DashboardBadge tone="blue">{adminT.statuses.PARTIALLY_PAID}</DashboardBadge>;
  }
  if (paymentStatus === "PAST_DUE") {
    return <DashboardBadge tone="red">{adminT.statuses.PAST_DUE}</DashboardBadge>;
  }
  if (paymentStatus === "FAILED") {
    return <DashboardBadge tone="red">{adminT.tickets.badgeFailed}</DashboardBadge>;
  }
  if (paymentStatus === "EXPIRED") {
    return <DashboardBadge tone="neutral">{adminT.tickets.badgeExpired}</DashboardBadge>;
  }
  switch (status) {
    case "PAID": return <DashboardBadge tone="blue">{adminT.tickets.badgePaid}</DashboardBadge>;
    case "CHECKED_ONE_DAY": return <DashboardBadge tone="green">{adminT.tickets.badgeCheckedIn}</DashboardBadge>;
    case "CHECKED_TWO_DAY": return <DashboardBadge tone="green">{adminT.tickets.badgeCheckedIn}</DashboardBadge>;
    case "CHECKED_GALA_DINNER": return <DashboardBadge tone="purple">{adminT.tickets.badgeGalaCheckedIn}</DashboardBadge>;
    case "PENDING":
      // Surface the latest payment state so an unpaid ticket shows why it is still
      // unpaid (failed / expired) rather than a flat "pending".
      return <DashboardBadge tone="amber">{adminT.tickets.badgePending}</DashboardBadge>;
    case "CANCELED": return <DashboardBadge tone="red">{adminT.tickets.badgeCanceled}</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

function SendPaymentLinkAction({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setState("loading");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/tickets/payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reason?: string;
      };

      if (res.ok && data.ok) {
        setState("success");
        setMessage(adminT.tickets.paymentLinkSent);
        router.refresh();
        return;
      }

      setState("error");
      setMessage(
        data.reason === "already_paid"
          ? adminT.tickets.paymentLinkAlreadyPaid
          : data.reason === "not_found"
            ? adminT.tickets.paymentLinkNotFound
            : data.reason === "email_failed"
              ? adminT.tickets.paymentLinkEmailFailed
              : adminT.tickets.paymentLinkError
      );
    } catch {
      setState("error");
      setMessage(adminT.tickets.paymentLinkError);
    }
  }

  const loading = state === "loading";

  return (
    <div className="mt-1 flex flex-col gap-2">
      <button
        type="button"
        onClick={send}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] border border-[var(--color-blue)]/40 bg-[var(--color-blue-wash)]/70 px-4 py-2.5 text-[0.85rem] font-semibold text-[var(--color-blue)] transition-colors hover:bg-[var(--color-blue-wash)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Send size={15} strokeWidth={1.9} />
        {loading ? adminT.tickets.sendingPaymentLink : adminT.tickets.sendPaymentLink}
      </button>
      {message && (
        <p
          className={`text-[0.8rem] ${state === "success" ? "text-emerald-600" : "text-red-600"}`}
        >
          {message}
        </p>
      )}
      {state !== "error" && (
        <p className="text-[0.76rem] text-[var(--color-ink-muted)]">
          {adminT.tickets.resendHint}
        </p>
      )}
    </div>
  );
}

function ticketTypeLabelRu(type: string) {
  if (type === "GALA_ONLY") return "Только гала-ужин";
  return adminT.tickets.typeLabels[type] ?? type.replace("_", " ").toLowerCase();
}

function formatDate(date: Date | null | string) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("ru-RU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function PaymentSummary({ payment, complimentary = false }: { payment: TicketPayment | null; complimentary?: boolean }) {
  if (!payment) {
    return (
      <div className="rounded-[20px] border border-dashed border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)]/35 px-4 py-4 text-sm text-[var(--color-ink-soft)]">
        {complimentary ? "Бесплатный пропуск — оплата не требуется." : adminT.tickets.paymentFailureUnknown}
      </div>
    );
  }

  const isInstallment = payment.paymentPlan === "TWO_INSTALLMENTS";
  const installmentAmounts = isInstallment
    ? splitTicketTotalIntoTwoPayments(payment.amount)
    : null;
  const paidNow = payment.status === "FAILED" || payment.status === "EXPIRED" || payment.status === "PENDING"
    ? 0
    : installmentAmounts && payment.status !== "PAID"
      ? installmentAmounts.firstAmountCents
      : payment.amount;
  const isPastDue = payment.status === "PAST_DUE";
  const isFailed = payment.status === "FAILED";
  const isPending = payment.status === "PENDING" || payment.status === "EXPIRED";
  const isPartial = payment.status === "PARTIALLY_PAID" || isPastDue;
  const statusTone = isPastDue || isFailed ? "border-red-200 bg-red-50/70" : isPartial ? "border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)]/55" : isPending ? "border-[rgba(114,160,193,0.24)] bg-white/72" : "border-emerald-200 bg-emerald-50/65";
  const statusLabel = isPastDue
    ? adminT.tickets.paymentPastDue
    : isFailed
      ? adminT.tickets.badgeFailed
      : isPending
        ? payment.status === "EXPIRED" ? adminT.tickets.badgeExpired : adminT.tickets.badgePending
        : payment.status === "PARTIALLY_PAID"
          ? adminT.statuses.PARTIALLY_PAID
          : adminT.statuses.PAID;

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${statusTone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[13px] bg-white/75 text-[var(--color-blue)] shadow-sm">
            {isPastDue || isFailed ? <AlertTriangle size={17} /> : <CreditCard size={17} />}
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              {adminT.tickets.paymentPlan}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
              {isInstallment ? adminT.tickets.installments : adminT.tickets.fullPayment}
            </p>
          </div>
        </div>
        <DashboardBadge tone={isPastDue || isFailed ? "red" : isPartial ? "blue" : isPending ? "amber" : "green"}>
          {statusLabel}
        </DashboardBadge>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-[15px] bg-white/62 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">{adminT.tickets.paidNow}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatMoney(paidNow, payment.currency)}</p>
        </div>
        <div className="rounded-[15px] bg-white/62 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">{adminT.tickets.orderTotal}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatMoney(payment.amount, payment.currency)}</p>
        </div>
        <div className="rounded-[15px] bg-white/62 px-3 py-2.5">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            <CalendarClock size={12} />
            {adminT.tickets.nextPayment}
          </p>
          <p className={`mt-1 text-sm font-semibold ${isPastDue ? "text-red-700" : "text-[var(--color-ink)]"}`}>
            {payment.nextPaymentAt ? formatDate(payment.nextPaymentAt) : "—"}
          </p>
        </div>
      </div>

      {(isPastDue || isFailed) && (
        <div className="mt-3 rounded-[15px] border border-red-200/80 bg-white/60 px-3 py-2.5 text-xs leading-5 text-red-800">
          <span className="font-semibold">{adminT.tickets.paymentFailure}:</span>{" "}
          {payment.lastPaymentError || adminT.tickets.paymentFailureUnknown}
          {payment.lastPaymentFailedAt ? <span className="ml-1 text-red-700/70">({formatDate(payment.lastPaymentFailedAt)})</span> : null}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-[rgba(37,42,45,0.07)] bg-white/72 px-3.5 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        {label}
      </p>
      <div className="mt-1 break-words text-[0.86rem] font-medium text-[var(--color-ink)]">
        {value || <span className="text-[var(--color-ink-muted)]">—</span>}
      </div>
    </div>
  );
}

function AccessCheckIn({ ticket }: { ticket: TicketRecord }) {
  const checkIns = [
    {
      key: "day-one",
      label: adminT.scanner.dayOne,
      checkedAt: ticket.dayOneCheckInAt ?? ticket.forumCheckInAt,
    },
    {
      key: "day-two",
      label: adminT.scanner.dayTwo,
      checkedAt: ticket.dayTwoCheckInAt,
    },
    ...(ticket.galaDinner
      ? [{
          key: "gala",
          label: adminT.scanner.galaDinner,
          checkedAt: ticket.galaCheckInAt,
        }]
      : []),
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {checkIns.map((checkIn) => {
        return (
          <div key={checkIn.key} className="flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--color-ink)]">
              {checkIn.label}
            </span>
            {checkIn.checkedAt ? (
              <DashboardBadge tone="green">{formatDate(checkIn.checkedAt)}</DashboardBadge>
            ) : (
              <span className="text-[0.78rem] text-[var(--color-ink-muted)]">
                {adminT.tickets.notCheckedIn}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ticketFormState(ticket: TicketRecord): TicketFormState {
  return {
    fullName: ticket.fullName,
    email: ticket.email,
    phone: ticket.phone,
    instagram: ticket.instagram ?? "",
    type: ticket.type === "ONE_DAY" ? "ONE_DAY" : "TWO_DAYS",
    galaDinner: ticket.galaDinner,
  };
}

function isFormDirty(ticket: TicketRecord, form: TicketFormState) {
  const initial = ticketFormState(ticket);
  return (
    initial.fullName !== form.fullName ||
    initial.email !== form.email ||
    initial.phone !== form.phone ||
    initial.instagram !== form.instagram ||
    initial.type !== form.type ||
    initial.galaDinner !== form.galaDinner
  );
}

function changedFieldSummary(ticket: TicketRecord, form: TicketFormState) {
  const initial = ticketFormState(ticket);
  const labels: Partial<Record<keyof TicketFormState, string>> = {
    fullName: ticketAdminCopy.customerName,
    email: ticketAdminCopy.email,
    phone: ticketAdminCopy.phone,
    instagram: "Instagram",
    type: ticketAdminCopy.ticketType,
    galaDinner: ticketAdminCopy.galaDinner,
  };
  return (Object.keys(labels) as Array<keyof TicketFormState>)
    .filter((field) => initial[field] !== form[field])
    .map((field) => {
      const before =
        field === "type"
          ? ticketTypeLabelRu(String(initial[field]))
          : field === "galaDinner"
            ? initial[field]
              ? ticketAdminCopy.included
              : ticketAdminCopy.notIncluded
            : String(initial[field] || "—");
      const after =
        field === "type"
          ? ticketTypeLabelRu(String(form[field]))
          : field === "galaDinner"
            ? form[field]
              ? ticketAdminCopy.included
              : ticketAdminCopy.notIncluded
            : String(form[field] || "—");
      return `${labels[field]}: ${before} → ${after}`;
    });
}

const fieldInputClass =
  "w-full rounded-[12px] border border-[rgba(37,42,45,0.12)] bg-white/82 px-3.5 py-2.5 text-[0.88rem] text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[rgba(114,160,193,0.22)]";

const smallButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/82 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] shadow-[0_10px_24px_rgba(37,42,45,0.05)] transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] disabled:cursor-not-allowed disabled:opacity-55";

function activeQr(ticket: TicketRecord) {
  return ticket.qrCredentials.find((credential) => credential.status === "ACTIVE") ?? null;
}

function EditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function QrPreviewDialog({
  preview,
  loading,
  onClose,
  onGenerate,
}: {
  preview: QrPreview | null;
  loading: boolean;
  onClose: () => void;
  onGenerate: () => void;
}) {
  const ticket = preview?.ticket;
  const credential = preview?.credential ?? null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(3,2,19,0.28)] p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-t-[30px] border border-[rgba(114,160,193,0.22)] bg-white/95 p-6 shadow-[0_28px_90px_rgba(3,2,19,0.2)] backdrop-blur-2xl sm:rounded-[30px]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
              {ticketAdminCopy.qrCode}
            </p>
            <h2 className="mt-1 font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
              {ticket?.fullName ?? ticketAdminCopy.ticketQr}
            </h2>
          </div>
          <IconButton
            label={ticketAdminCopy.closeQrPreview}
            icon={X}
            onClick={onClose}
            className="size-9"
          />
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-[var(--color-blue)]">
            <Loader2 aria-hidden className="animate-spin" size={28} />
          </div>
        ) : ticket ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <DetailItem label={adminT.tickets.buyer} value={ticket.fullName} />
              <DetailItem label={adminT.detail.email} value={ticket.email} />
              <DetailItem label={adminT.tickets.ticketType} value={ticketTypeLabelRu(ticket.type)} />
              <DetailItem label={adminT.tickets.galaDinner} value={ticket.galaDinner ? adminT.tickets.included : adminT.tickets.notIncluded} />
              <DetailItem label={ticketAdminCopy.qrStatus} value={qrStatusLabel(credential?.status)} />
              <DetailItem label={ticketAdminCopy.generated} value={credential ? formatDate(credential.generatedAt) : null} />
            </div>

            {preview?.qrDataUrl ? (
              <div className="flex flex-col items-center rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-[var(--color-blue-wash)]/50 p-5">
                <Image
                  src={preview.qrDataUrl}
                  alt={`QR-код для ${ticket.fullName}`}
                  width={256}
                  height={256}
                  unoptimized
                  className="size-64 rounded-[16px] border border-white bg-white p-3 shadow-[0_16px_38px_rgba(37,42,45,0.08)]"
                />
              </div>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[rgba(114,160,193,0.32)] bg-white/70 p-5 text-center">
                <p className="text-sm text-[var(--color-ink-soft)]">
                  {ticketAdminCopy.noActiveQr}
                </p>
                <button type="button" onClick={onGenerate} className={`${smallButtonClass} mt-4`}>
                  <RefreshCw size={15} />
                  {ticketAdminCopy.generateQr}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-600">{ticketAdminCopy.qrPreviewUnavailable}</p>
        )}
      </div>
    </div>,
    document.body
  );
}

function TicketDetailPanel({
  ticket,
  onDirtyChange,
  onToast,
}: {
  ticket: TicketRecord;
  onDirtyChange: (dirty: boolean) => void;
  onToast: (toast: ToastState) => void;
}) {
  const payment = ticket.payments[0] ?? null;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<TicketFormState>(() => ticketFormState(ticket));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [qrPending, setQrPending] = useState<null | "preview" | "generate" | "regenerate" | "resend">(null);
  const [qrPreview, setQrPreview] = useState<QrPreview | null>(null);
  const [showQr, setShowQr] = useState(false);
  const dirty = editing && isFormDirty(ticket, form);
  const qr = activeQr(ticket);
  const canDelete = ticketCanBeDeleted(ticket.status, payment?.status);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  function updateForm<K extends keyof TicketFormState>(field: K, value: TicketFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function cancelEdit() {
    setForm(ticketFormState(ticket));
    setEditing(false);
    onDirtyChange(false);
  }

  async function saveEdit() {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      onToast({ tone: "error", message: ticketAdminCopy.requiredFields });
      return;
    }

    const changes = changedFieldSummary(ticket, form);
    const accessChanged = form.type !== ticket.type || form.galaDinner !== ticket.galaDinner;
    let sendUpdatedQr = false;

    if (accessChanged) {
      const confirmed = window.confirm(
        `${ticketAdminCopy.confirmTicketChanges}\n\n${changes.join("\n")}\n\n${ticketAdminCopy.accessChangeWarning}`
      );
      if (!confirmed) return;
      sendUpdatedQr = window.confirm(ticketAdminCopy.sendUpdatedQrNow);
    }

    if (!accessChanged && changes.length > 0) {
      const confirmed = window.confirm(`${ticketAdminCopy.confirmTicketChanges}\n\n${changes.join("\n")}`);
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/tickets/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket: {
            ticketId: ticket.id,
            updatedAt: new Date(ticket.updatedAt).toISOString(),
            ...form,
            instagram: form.instagram.trim() || null,
          },
          sendUpdatedQr,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        qrRegenerated?: boolean;
        email?: { delivered?: boolean };
      };

      if (!res.ok || !data.ok) {
        onToast({ tone: "error", message: ticketAdminCopy.saveFailed });
        return;
      }

      setEditing(false);
      onDirtyChange(false);
      onToast({
        tone: data.email?.delivered === false ? "info" : "success",
        message: data.qrRegenerated
          ? data.email?.delivered
            ? ticketAdminCopy.ticketUpdatedQrSent
            : ticketAdminCopy.ticketUpdatedQrDeliveryHint
          : ticketAdminCopy.ticketUpdated,
      });
      router.refresh();
    } catch {
      onToast({ tone: "error", message: ticketAdminCopy.saveNetworkError });
    } finally {
      setSaving(false);
    }
  }

  async function runQrAction(action: "preview" | "generate" | "regenerate_resend" | "resend_current") {
    if (action === "regenerate_resend") {
      const confirmed = window.confirm(
        `${ticketAdminCopy.regenerateQrTitle}\n\n${ticketAdminCopy.regenerateQrWarning}`
      );
      if (!confirmed) return;
    }

    const pending =
      action === "preview"
        ? "preview"
        : action === "generate"
          ? "generate"
          : action === "regenerate_resend"
            ? "regenerate"
            : "resend";
    setQrPending(pending);
    if (action === "preview") setShowQr(true);

    try {
      const res = await fetch("/api/admin/tickets/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id, action }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        ticket?: TicketRecord;
        credential?: TicketQrCredential | null;
        qrDataUrl?: string | null;
        message?: string;
        reason?: string;
      };

      if (action === "preview" || action === "generate") {
        if (data.ok && data.ticket) {
          setQrPreview({
            ticket: data.ticket,
            credential: data.credential ?? null,
            qrDataUrl: data.qrDataUrl ?? null,
          });
        } else {
          onToast({ tone: "error", message: ticketAdminCopy.loadQrFailed });
        }
        return;
      }

      if (res.ok && data.ok) {
        onToast({
          tone: "success",
          message:
            action === "resend_current"
              ? ticketAdminCopy.currentQrResent
              : ticketAdminCopy.newQrSent,
        });
        router.refresh();
        return;
      }

      onToast({
        tone: data.reason === "email_failed" ? "info" : "error",
        message:
          data.reason === "email_failed"
            ? ticketAdminCopy.qrEmailFailed
            : ticketAdminCopy.qrActionFailed,
      });
      router.refresh();
    } catch {
      onToast({ tone: "error", message: ticketAdminCopy.qrNetworkError });
    } finally {
      setQrPending(null);
    }
  }

  async function deleteTicket() {
    if (!window.confirm(ticketAdminCopy.deleteTicketConfirm(ticket.fullName))) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/tickets/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        onToast({ tone: "error", message: ticketAdminCopy.deleteFailed });
        return;
      }

      onDirtyChange(false);
      onToast({ tone: "success", message: ticketAdminCopy.ticketDeleted });
      router.refresh();
    } catch {
      onToast({ tone: "error", message: ticketAdminCopy.deleteNetworkError });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="px-4 pb-4 pt-3 lg:px-5">
      <div className="relative">
        {!editing && ticket.origin !== "JURY_GALA" && (
          <IconButton
            label={ticketAdminCopy.editTicket}
            icon={Pencil}
            onClick={() => {
              setForm(ticketFormState(ticket));
              setEditing(true);
            }}
            className="absolute right-0 top-0 size-9"
          />
        )}

        {editing ? (
          <div className="grid gap-3 pr-12 sm:grid-cols-2">
            <EditField label={adminT.tickets.buyer}>
              <input className={fieldInputClass} value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} />
            </EditField>
            <EditField label={adminT.detail.email}>
              <input className={fieldInputClass} type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
            </EditField>
            <EditField label={adminT.detail.phone}>
              <input className={fieldInputClass} value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            </EditField>
            <EditField label="Instagram">
              <input className={fieldInputClass} value={form.instagram} onChange={(e) => updateForm("instagram", e.target.value)} />
            </EditField>
            <EditField label={adminT.tickets.ticketType}>
              <select className={fieldInputClass} value={form.type} onChange={(e) => updateForm("type", e.target.value as TicketFormState["type"])}>
                <option value="ONE_DAY">{ticketTypeLabelRu("ONE_DAY")}</option>
                <option value="TWO_DAYS">{ticketTypeLabelRu("TWO_DAYS")}</option>
              </select>
            </EditField>
            <EditField label={adminT.tickets.galaDinner}>
              <label className="inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-[rgba(37,42,45,0.12)] bg-white/82 px-3.5 text-[0.88rem] font-medium text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  checked={form.galaDinner}
                  onChange={(e) => updateForm("galaDinner", e.target.checked)}
                  className="admin-checkbox"
                />
                {form.galaDinner ? adminT.tickets.included : adminT.tickets.notIncluded}
              </label>
            </EditField>
            <div className="flex flex-col gap-2 pt-1 sm:col-span-2 sm:flex-row sm:justify-end">
              <button type="button" className={smallButtonClass} onClick={cancelEdit} disabled={saving}>
                <X size={15} />
                {ticketAdminCopy.cancel}
              </button>
              <button type="button" className={`${smallButtonClass} border-[var(--color-blue)] bg-[var(--color-blue)] text-white hover:bg-[#4d86ad]`} onClick={saveEdit} disabled={saving || !dirty}>
                {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                {ticketAdminCopy.saveChanges}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-2.5 pr-12 sm:grid-cols-2">
      <DetailItem label={adminT.tickets.buyer} value={ticket.fullName} />
      <DetailItem
        label={adminT.detail.email}
        value={
          <a href={`mailto:${ticket.email}`} className="text-[var(--color-blue)] hover:underline">
            {ticket.email}
          </a>
        }
      />
      <DetailItem
        label={adminT.detail.phone}
        value={
          ticket.phone ? (
            <a href={`tel:${ticket.phone}`} className="text-[var(--color-blue)] hover:underline">
              {ticket.phone}
            </a>
          ) : null
        }
      />
      <DetailItem
        label="Instagram"
        value={
          ticket.instagram ? (
            <a
              href={instagramProfileUrl(ticket.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-blue)] hover:underline"
            >
              @{ticket.instagram}
            </a>
          ) : null
        }
      />
      <DetailItem label={adminT.tickets.ticketType} value={ticketTypeLabelRu(ticket.type)} />
      <DetailItem label={adminT.tickets.galaDinner} value={ticket.galaDinner ? adminT.tickets.included : adminT.tickets.notIncluded} />
      <DetailItem
        label={adminT.tickets.price}
        value={payment ? formatMoney(payment.amount, payment.currency) : null}
      />
      <DetailItem label={adminT.tickets.paymentStatus} value={ticketStatusBadge(ticket.status, payment?.status)} />
      <div className="sm:col-span-2">
        <PaymentSummary payment={payment} complimentary={ticket.origin === "JURY_GALA"} />
      </div>
      <DetailItem label={adminT.tickets.paymentTime} value={ticket.paidAt ? formatDate(ticket.paidAt) : null} />
      <DetailItem label={adminT.tickets.created} value={formatDate(ticket.createdAt)} />
      <div className="sm:col-span-2">
        <DetailItem label={adminT.tickets.checkIn} value={<AccessCheckIn ticket={ticket} />} />
      </div>
      <DetailItem label={adminT.tickets.membership} value={ticket.isIbpaMember ? adminT.tickets.ibpaMember : adminT.tickets.standard} />
      {ticket.status === "PENDING" && (
        <div className="sm:col-span-2">
          <DetailItem
            label={adminT.tickets.paymentLink}
            value={<SendPaymentLinkAction ticketId={ticket.id} />}
          />
        </div>
      )}
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-[rgba(37,42,45,0.08)] pt-4">
        <div className="mb-3 flex flex-col gap-1 text-[0.8rem] text-[var(--color-ink-soft)] sm:flex-row sm:items-center sm:justify-between">
          <span>
            {ticketAdminCopy.qrCodeStatus}:{" "}
            <strong className="text-[var(--color-ink)]">{qrStatusLabel(qr?.status)}</strong>
            {qr ? ` · ${ticketAdminCopy.generated} ${formatDate(qr.generatedAt)}` : ""}
          </span>
          {qr?.lastSentAt ? <span>{ticketAdminCopy.lastSent}: {formatDate(qr.lastSentAt)}</span> : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" className={smallButtonClass} onClick={() => runQrAction("preview")} disabled={saving || deleting || qrPending !== null}>
            {qrPending === "preview" ? <Loader2 className="animate-spin" size={15} /> : <QrCode size={15} />}
            {ticketAdminCopy.viewQr}
          </button>
          <button type="button" className={smallButtonClass} onClick={() => runQrAction("regenerate_resend")} disabled={saving || deleting || qrPending !== null || ticket.status === "PENDING" || ticket.status === "CANCELED"}>
            {qrPending === "regenerate" ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />}
            {ticketAdminCopy.regenerateAndResend}
          </button>
          {qr && (
            <button type="button" className={smallButtonClass} onClick={() => runQrAction("resend_current")} disabled={saving || deleting || qrPending !== null || ticket.status === "PENDING" || ticket.status === "CANCELED"}>
              {qrPending === "resend" ? <Loader2 className="animate-spin" size={15} /> : <Mail size={15} />}
              {ticketAdminCopy.resendCurrent}
            </button>
          )}
          {canDelete && (
            <DashboardDangerBtn
              type="button"
              onClick={() => void deleteTicket()}
              disabled={saving || deleting || qrPending !== null}
              className="sm:ml-auto"
            >
              {deleting ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
              {ticketAdminCopy.deleteTicket}
            </DashboardDangerBtn>
          )}
        </div>
      </div>

      {showQr && (
        <QrPreviewDialog
          preview={qrPreview}
          loading={qrPending === "preview" || qrPending === "generate"}
          onClose={() => setShowQr(false)}
          onGenerate={() => runQrAction("generate")}
        />
      )}
    </div>
  );
}

function TicketRow({
  ticket,
  expanded,
  onToggle,
  reduceMotion,
  onToast,
}: {
  ticket: TicketRecord;
  expanded: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
  onToast: (toast: ToastState) => void;
}) {
  const panelId = `ticket-detail-${ticket.id}`;
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const requestToggle = () => {
    if (
      expanded &&
      hasUnsavedEdits &&
      !window.confirm(ticketAdminCopy.discardUnsaved)
    ) {
      return;
    }
    onToggle();
  };

  return (
    <div className="mx-3 my-3 overflow-hidden rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/62 shadow-[0_10px_26px_rgba(37,42,45,0.035)] lg:m-0 lg:rounded-none lg:border-0 lg:border-b lg:border-[rgba(37,42,45,0.08)] lg:bg-transparent lg:shadow-none lg:last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={requestToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            requestToggle();
          }
        }}
        className={`grid cursor-pointer gap-3 p-4 transition-colors hover:bg-[var(--color-blue-wash)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgba(114,160,193,0.45)] active:bg-[var(--color-blue-wash)] lg:min-h-[68px] lg:grid-cols-[minmax(0,1.7fr)_130px_92px_150px_150px_28px] lg:items-center lg:px-4 lg:py-4 ${
          expanded ? "bg-[var(--color-blue-wash)]/70 lg:bg-[var(--color-blue-wash)]/55" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-ink)]">{ticket.fullName}</p>
            <p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)]">{ticket.email}</p>
            {ticket.isIbpaMember && (
              <p className="text-[11px] font-semibold text-[var(--color-blue)]">{adminT.tickets.ibpaMember}</p>
            )}
            {ticket.origin === "SPECIAL_OFFER" ? (
              <div className="mt-2"><DashboardBadge tone="purple">Спецпредложение</DashboardBadge></div>
            ) : ticket.origin === "JURY_GALA" ? (
              <div className="mt-2"><DashboardBadge tone="purple">Бесплатный гала-ужин</DashboardBadge></div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            {ticketStatusBadge(ticket.status, ticket.payments[0]?.status)}
            <ChevronDown
              size={16}
              className={`shrink-0 text-[var(--color-ink-muted)] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        <p className="flex items-center justify-between gap-2 text-sm text-[var(--color-ink-soft)] lg:block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:hidden">{adminT.tickets.type}</span>
          {ticketTypeLabelRu(ticket.type)}
        </p>

        <div className="flex items-center justify-between gap-2 lg:block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:hidden">{adminT.tickets.gala}</span>
          {ticket.galaDinner ? <DashboardBadge tone="purple">{adminT.common.yes}</DashboardBadge> : <span className="text-xs text-[var(--color-ink-muted)]">{adminT.common.no}</span>}
        </div>

        <div className="hidden lg:block">{ticketStatusBadge(ticket.status, ticket.payments[0]?.status)}</div>

        <p className="flex items-center justify-between gap-2 text-xs text-[var(--color-ink-muted)] lg:block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:hidden">{adminT.tickets.lastCheckIn}</span>
          {formatDate(ticket.lastCheckIn)}
        </p>

        <ChevronDown
          size={16}
          aria-hidden
          className={`hidden shrink-0 justify-self-end text-[var(--color-ink-muted)] transition-transform duration-200 lg:block ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            key="detail"
            initial={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[rgba(37,42,45,0.07)] bg-white/40"
          >
            <TicketDetailPanel
              key={`${ticket.id}-${new Date(ticket.updatedAt).toISOString()}`}
              ticket={ticket}
              onDirtyChange={setHasUnsavedEdits}
              onToast={onToast}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScannerDialog({ onClose, onCheckIn }: { onClose: () => void; onCheckIn: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(3,2,19,0.28)] p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-auto rounded-t-[32px] border border-[rgba(114,160,193,0.22)] bg-white/94 p-6 shadow-[0_28px_90px_rgba(3,2,19,0.2)] backdrop-blur-2xl sm:rounded-[32px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">{adminT.tickets.scanTitle}</h2>
          <IconButton label={adminT.tickets.closeScanner} icon={X} onClick={onClose} className="size-9" />
        </div>
        <UnifiedScanner onAfterCheckIn={onCheckIn} />
      </div>
    </div>
  );
}

export default function TicketsPage({
  tickets,
  specialPacketEnabled,
}: {
  tickets: TicketRecord[];
  specialPacketEnabled: boolean;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const [showScanner, setShowScanner] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [packetEnabled, setPacketEnabled] = useState(specialPacketEnabled);
  const [packetPending, setPacketPending] = useState(false);

  function showToast(next: ToastState) {
    setToast(next);
    if (next) {
      window.setTimeout(() => setToast(null), 5200);
    }
  }

  async function toggleSpecialPacket() {
    if (packetPending) return;
    const next = !packetEnabled;
    setPacketPending(true);
    try {
      const response = await fetch("/api/admin/settings/special-packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!response.ok) throw new Error("Unable to update setting");
      setPacketEnabled(next);
      showToast({
        tone: "success",
        message: next
          ? "Special Packet sales are now enabled."
          : "Special Packet is disabled and shown as Coming Soon.",
      });
    } catch {
      showToast({ tone: "error", message: "Could not update the Special Packet setting." });
    } finally {
      setPacketPending(false);
    }
  }

  const paid = tickets.filter((t) => t.payments[0]?.status === "PAID");
  const checkedIn = tickets.filter((t) => t.status.startsWith("CHECKED"));
  const pending = tickets.filter((t) => t.status === "PENDING");
  const paymentAttention = tickets.filter((t) => {
    const status = t.payments[0]?.status;
    return status === "PARTIALLY_PAID" || status === "PAST_DUE" || status === "FAILED" || status === "EXPIRED";
  });

  const query = search.trim().toLowerCase();
  const filtered = tickets.filter(
    (t) =>
      t.fullName.toLowerCase().includes(query) ||
      t.email.toLowerCase().includes(query) ||
      (t.instagram ?? "").toLowerCase().includes(query)
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={adminT.tickets.label}
        title={adminT.tickets.title}
        actions={
          <DashboardPrimaryBtn onClick={() => setShowScanner(true)}>
            <Camera size={16} />
            {adminT.tickets.scanQr}
          </DashboardPrimaryBtn>
        }
      />

      <DashboardCard className="p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
              <PackageOpen size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Special Packet sales</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--color-ink-soft)]">
                Enables the fixed-price package for two complete 2-day Forum tickets with Gala Dinner access.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={packetEnabled}
            aria-label="Enable Special Packet sales"
            disabled={packetPending}
            onClick={() => void toggleSpecialPacket()}
            className={`relative inline-flex h-8 w-14 shrink-0 rounded-full border p-1 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)] disabled:cursor-wait disabled:opacity-60 ${
              packetEnabled
                ? "border-[var(--color-blue)] bg-[var(--color-blue)]"
                : "border-[rgba(37,42,45,0.14)] bg-[rgba(37,42,45,0.08)]"
            }`}
          >
            <span
              className={`size-[22px] rounded-full bg-white shadow-sm transition-transform ${
                packetEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(4,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            {adminT.tickets.totalTickets}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{tickets.length}</p>
        </DashboardAccentBlock>
        <DashboardMetricTile label={adminT.tickets.paid} value={paid.length} accent="blue" />
        <DashboardMetricTile label={adminT.tickets.checkedIn} value={checkedIn.length} accent="green" />
        <DashboardMetricTile label={adminT.tickets.pendingPayment} value={pending.length} accent="amber" />
        <DashboardMetricTile label={adminT.tickets.paymentAttention} value={paymentAttention.length} accent="red" />
      </div>

      <DashboardCard className="overflow-hidden p-0">
        <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={adminT.tickets.searchPlaceholder}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <DashboardEmptyState
              icon={<Ticket size={22} />}
              title={search ? adminT.tickets.emptySearchTitle : adminT.tickets.emptyTitle}
              description={search ? adminT.tickets.emptySearchText : adminT.tickets.emptyText}
            />
          </div>
        ) : (
          <div className="lg:divide-y lg:divide-[rgba(37,42,45,0.08)]">
            <div className="hidden grid-cols-[minmax(0,1.7fr)_130px_92px_150px_150px_28px] gap-3 border-b border-[rgba(37,42,45,0.08)] bg-white/62 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:grid">
              <span>{adminT.tickets.attendee}</span>
              <span>{adminT.tickets.type}</span>
              <span>{adminT.tickets.gala}</span>
              <span>{adminT.tickets.status}</span>
              <span>{adminT.tickets.lastCheckIn}</span>
              <span className="sr-only">{adminT.common.open}</span>
            </div>
            {filtered.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                expanded={expandedId === ticket.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === ticket.id ? null : ticket.id))
                }
                reduceMotion={reduceMotion}
                onToast={showToast}
              />
            ))}
          </div>
        )}
      </DashboardCard>

      {showScanner && (
        <ScannerDialog
          onClose={() => setShowScanner(false)}
          onCheckIn={() => router.refresh()}
        />
      )}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-[18px] border bg-white/95 px-4 py-3 text-sm shadow-[0_20px_60px_rgba(3,2,19,0.18)] backdrop-blur-xl ${
            toast.tone === "error"
              ? "border-red-200 text-red-700"
              : toast.tone === "success"
                ? "border-emerald-200 text-emerald-800"
                : "border-[rgba(114,160,193,0.28)] text-[var(--color-ink)]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
