"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ticket, Camera, X, Tag, ChevronDown } from "lucide-react";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardMetricTile,
  DashboardBadge,
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardPrimaryBtn,
  IconButton,
  SearchBar,
} from "@/shared/components/admin/DashboardUI";
import { instagramProfileUrl } from "@/features/tickets/lib/instagram";
import { adminT } from "@/lib/i18n/admin";
import UnifiedScanner from "@/features/check-in/components/UnifiedScanner";

type TicketPayment = {
  amount: number;
  currency: string;
  status: string;
};

type TicketRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  instagram: string | null;
  type: string;
  galaDinner: boolean;
  isIbpaMember: boolean;
  status: string;
  paidAt: Date | null;
  lastCheckIn: Date | null;
  forumCheckInAt: Date | null;
  galaCheckInAt: Date | null;
  createdAt: Date;
  payments: TicketPayment[];
};

function ticketStatusBadge(status: string) {
  switch (status) {
    case "PAID": return <DashboardBadge tone="blue">{adminT.tickets.badgePaid}</DashboardBadge>;
    case "CHECKED_ONE_DAY": return <DashboardBadge tone="green">{adminT.tickets.badgeCheckedIn}</DashboardBadge>;
    case "CHECKED_TWO_DAY": return <DashboardBadge tone="green">{adminT.tickets.badgeCheckedIn}</DashboardBadge>;
    case "CHECKED_GALA_DINNER": return <DashboardBadge tone="purple">{adminT.tickets.badgeGalaCheckedIn}</DashboardBadge>;
    case "PENDING": return <DashboardBadge tone="amber">{adminT.tickets.badgePending}</DashboardBadge>;
    case "CANCELED": return <DashboardBadge tone="red">{adminT.tickets.badgeCanceled}</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">{status}</DashboardBadge>;
  }
}

function ticketTypeLabelRu(type: string) {
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

function TicketDetailPanel({ ticket }: { ticket: TicketRecord }) {
  const payment = ticket.payments[0] ?? null;
  const checkInValue =
    ticket.forumCheckInAt || ticket.galaCheckInAt
      ? [
          ticket.forumCheckInAt ? `${adminT.tickets.forum} · ${formatDate(ticket.forumCheckInAt)}` : null,
          ticket.galaCheckInAt ? `${adminT.tickets.gala} · ${formatDate(ticket.galaCheckInAt)}` : null,
        ]
          .filter(Boolean)
          .join("  ·  ")
      : ticket.status.startsWith("CHECKED")
        ? formatDate(ticket.lastCheckIn)
        : adminT.tickets.notCheckedIn;

  return (
    <div className="grid gap-2.5 px-4 pb-4 pt-1 sm:grid-cols-2 lg:px-5">
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
      <DetailItem label={adminT.tickets.paymentStatus} value={ticketStatusBadge(ticket.status)} />
      <DetailItem label={adminT.tickets.paymentTime} value={ticket.paidAt ? formatDate(ticket.paidAt) : null} />
      <DetailItem label={adminT.tickets.created} value={formatDate(ticket.createdAt)} />
      <DetailItem label={adminT.tickets.checkIn} value={checkInValue} />
      <DetailItem label={adminT.tickets.membership} value={ticket.isIbpaMember ? adminT.tickets.ibpaMember : adminT.tickets.standard} />
    </div>
  );
}

function TicketRow({
  ticket,
  expanded,
  onToggle,
  reduceMotion,
}: {
  ticket: TicketRecord;
  expanded: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  const panelId = `ticket-detail-${ticket.id}`;

  return (
    <div className="mx-3 my-3 overflow-hidden rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/62 shadow-[0_10px_26px_rgba(37,42,45,0.035)] lg:m-0 lg:rounded-none lg:border-0 lg:border-b lg:border-[rgba(37,42,45,0.08)] lg:bg-transparent lg:shadow-none lg:last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
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
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            {ticketStatusBadge(ticket.status)}
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

        <div className="hidden lg:block">{ticketStatusBadge(ticket.status)}</div>

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
            <TicketDetailPanel ticket={ticket} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
        <div className="flex items-center gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-[18px] ${enabled ? "bg-[rgba(114,160,193,0.1)] text-[var(--color-blue)]" : "bg-white/62 text-[var(--color-ink-muted)]"}`}>
            <Tag size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">{adminT.tickets.earlyBird}</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--color-ink)]">
              {enabled ? adminT.tickets.earlyBirdOn : adminT.tickets.earlyBirdOff}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          aria-label={enabled ? adminT.tickets.earlyBirdDisable : adminT.tickets.earlyBirdEnable}
          className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
          style={{ backgroundColor: enabled ? "var(--color-blue)" : "rgba(37,42,45,0.16)" }}
        >
          <span
            className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{ transform: enabled ? "translateX(20px)" : "translateX(2px)" }}
          />
        </button>
      </div>
    </DashboardCard>
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
  initialEarlyBirdEnabled,
}: {
  tickets: TicketRecord[];
  initialEarlyBirdEnabled: boolean;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const [showScanner, setShowScanner] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const paid = tickets.filter((t) => t.status !== "PENDING" && t.status !== "CANCELED");
  const checkedIn = tickets.filter((t) => t.status.startsWith("CHECKED"));
  const pending = tickets.filter((t) => t.status === "PENDING");

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

      <EarlyBirdToggle initialEnabled={initialEarlyBirdEnabled} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            {adminT.tickets.totalTickets}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{tickets.length}</p>
        </DashboardAccentBlock>
        <DashboardMetricTile label={adminT.tickets.paid} value={paid.length} accent="blue" />
        <DashboardMetricTile label={adminT.tickets.checkedIn} value={checkedIn.length} accent="green" />
        <DashboardMetricTile label={adminT.tickets.pendingPayment} value={pending.length} accent="amber" />
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
    </div>
  );
}
