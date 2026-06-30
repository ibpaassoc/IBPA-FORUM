"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Camera, X, Tag } from "lucide-react";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardMetricTile,
  DashboardBadge,
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardPrimaryBtn,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";
import UnifiedScanner from "@/features/check-in/components/UnifiedScanner";

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
        <div className="flex items-center gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-[18px] ${enabled ? "bg-[rgba(114,160,193,0.1)] text-[var(--color-blue)]" : "bg-white/62 text-[var(--color-ink-muted)]"}`}>
            <Tag size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">Early Bird Discount</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--color-ink)]">
              {enabled ? "On — discounted prices shown" : "Off — regular prices"}
            </p>
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
    </DashboardCard>
  );
}

function ScannerDialog({ onClose, onCheckIn }: { onClose: () => void; onCheckIn: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(3,2,19,0.32)] backdrop-blur-sm sm:items-center">
      <div className="max-h-[92vh] w-full max-w-md overflow-auto rounded-t-[28px] bg-white p-6 sm:rounded-[28px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">Scan ticket</h2>
          <button
            onClick={onClose}
            aria-label="Close scanner"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(37,42,45,0.08)] text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)]"
          >
            <X size={18} />
          </button>
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
            <div className="hidden grid-cols-[minmax(0,1.7fr)_130px_92px_150px_150px] gap-3 border-b border-[rgba(37,42,45,0.08)] bg-white/62 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:grid">
              <span>Attendee</span>
              <span>Type</span>
              <span>Gala</span>
              <span>Status</span>
              <span>Last check-in</span>
            </div>
            {filtered.map((ticket) => (
              <div
                key={ticket.id}
                className="mx-3 my-3 grid gap-3 rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/62 p-4 shadow-[0_10px_26px_rgba(37,42,45,0.035)] lg:m-0 lg:min-h-[68px] lg:grid-cols-[minmax(0,1.7fr)_130px_92px_150px_150px] lg:items-center lg:gap-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-4 lg:py-4 lg:shadow-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{ticket.fullName}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)]">{ticket.email}</p>
                    {ticket.isIbpaMember && (
                      <p className="text-[11px] font-semibold text-[var(--color-blue)]">IBPA Member</p>
                    )}
                  </div>
                  <div className="lg:hidden">{ticketStatusBadge(ticket.status)}</div>
                </div>

                <p className="flex items-center justify-between gap-2 text-sm capitalize text-[var(--color-ink-soft)] lg:block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:hidden">Type</span>
                  {ticket.type.replace("_", " ").toLowerCase()}
                </p>

                <div className="flex items-center justify-between gap-2 lg:block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:hidden">Gala</span>
                  {ticket.galaDinner ? <DashboardBadge tone="purple">Yes</DashboardBadge> : <span className="text-xs text-[var(--color-ink-muted)]">No</span>}
                </div>

                <div className="hidden lg:block">{ticketStatusBadge(ticket.status)}</div>

                <p className="flex items-center justify-between gap-2 text-xs text-[var(--color-ink-muted)] lg:block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:hidden">Last check-in</span>
                  {formatDate(ticket.lastCheckIn)}
                </p>
              </div>
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
