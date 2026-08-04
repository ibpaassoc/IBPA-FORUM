import { QrCode, Ticket, WalletCards } from "lucide-react";
import { getTestTickets } from "@/features/test/server/ticket-scenarios";
import { TestSubmitButton } from "@/features/test/components/TestSubmitButton";
import { completeTestTicketPaymentAction, createTestTicketAction, testTicketQrAction, updateTestTicketAction } from "./actions";
import {
  DashboardHeader,
  DashboardSection,
  EmptyState,
  GlassCard,
  StatusBadge,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/shared/components/admin/DashboardUI";

export default async function TestTicketsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const [query, tickets] = await Promise.all([searchParams, getTestTickets()]);
  const defaultRecipient = process.env.TEST_EMAIL_RECIPIENT ?? "";
  return (
    <div className="space-y-8">
      <DashboardHeader label="No live charges" title="Ticket testing" description="Create tickets through the production reservation logic and complete payments through the same post-payment handler as Stripe webhooks. All sessions, payments, QR credentials, emails, and activity remain test-scoped." />
      {query.created ? <div role="status" className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">Test ticket created successfully.</div> : null}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-3"><WalletCards aria-hidden className="text-[var(--color-blue)]" size={20} /><h2 className="font-[var(--font-title-family)] text-2xl font-light">Create ticket scenario</h2></div>
        <form action={createTestTicketAction} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Ticket type<select name="type" className={`${dashboardSelectClass} mt-2`}><option value="ONE_DAY">One day</option><option value="TWO_DAYS">Two days</option></select></label>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">Discount<select name="discountPercent" className={`${dashboardSelectClass} mt-2`}><option value="0">No discount</option><option value="30">30% test discount</option><option value="40">40% test discount</option></select></label>
          <div className="flex flex-wrap items-center gap-5 rounded-[18px] border border-[rgba(114,160,193,0.16)] bg-white/70 px-4 py-3 text-sm"><label><input type="checkbox" name="galaDinner" className="mr-2" />Gala dinner</label><label><input type="checkbox" name="isIbpaMember" className="mr-2" />IBPA member</label><label><input type="checkbox" name="paid" className="mr-2" />Paid</label></div>
          <div className="sm:col-span-2 lg:col-span-3"><TestSubmitButton idle="Create test ticket" pending="Creating…" /></div>
        </form>
      </GlassCard>
      <DashboardSection title="Test tickets" eyebrow={`${tickets.length} isolated ticket${tickets.length === 1 ? "" : "s"}`}>
        {tickets.length === 0 ? <EmptyState icon={<Ticket size={20} />} title="No test tickets yet" description="Create paid and unpaid scenarios above. Production tickets never appear here." /> : (
          <div className="grid gap-4">
            {tickets.map((ticket) => {
              const payment = ticket.payments[0];
              const activeQr = ticket.qrCredentials.find((credential) => credential.status === "ACTIVE");
              return (
                <GlassCard key={ticket.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-[var(--font-title-family)] text-2xl font-light">{ticket.fullName}</h2><StatusBadge tone="blue">TEST</StatusBadge><StatusBadge tone={ticket.status === "PAID" ? "green" : "amber"}>{ticket.status}</StatusBadge></div><p className="mt-1 text-sm text-[var(--color-ink-soft)]">{ticket.email} · {ticket.type} {ticket.galaDinner ? "· gala" : ""}</p><p className="mt-2 text-xs text-[var(--color-ink-soft)]">Payment: {payment ? `${payment.status} · $${(payment.amount / 100).toFixed(2)}` : "none"} · discount {ticket.promoDiscountPercent ?? 0}%</p></div>
                    {ticket.status === "PENDING" ? <form action={completeTestTicketPaymentAction}><input type="hidden" name="ticketId" value={ticket.id} /><TestSubmitButton idle="Simulate payment" pending="Completing…" /></form> : null}
                  </div>
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    <form action={updateTestTicketAction} className="grid gap-3 rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-white/70 p-4 sm:grid-cols-2">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input name="fullName" defaultValue={ticket.fullName} className={dashboardInputClass} aria-label="Full name" />
                      <input name="email" type="email" defaultValue={ticket.email} className={dashboardInputClass} aria-label="Email" />
                      <input name="phone" defaultValue={ticket.phone} className={dashboardInputClass} aria-label="Phone" />
                      <input name="instagram" defaultValue={ticket.instagram ?? ""} className={dashboardInputClass} aria-label="Instagram" />
                      <select name="type" defaultValue={ticket.type} className={dashboardSelectClass}><option value="ONE_DAY">One day</option><option value="TWO_DAYS">Two days</option></select>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="galaDinner" defaultChecked={ticket.galaDinner} /> Gala dinner</label>
                      <div className="sm:col-span-2"><TestSubmitButton idle="Update with real service" pending="Updating…" /></div>
                    </form>
                    <div className="rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-white/70 p-4">
                      <div className="flex items-center gap-2"><QrCode aria-hidden size={18} className="text-[var(--color-blue)]" /><p className="text-sm font-semibold">QR credentials</p></div>
                      <p className="mt-2 text-xs text-[var(--color-ink-soft)]">{ticket.qrCredentials.length} generated · active {activeQr ? activeQr.id : "none"}</p>
                      {ticket.status === "PAID" ? <div className="mt-4 grid gap-2">
                        {["resend", "replace", "replace-send"].map((mode) => <form key={mode} action={testTicketQrAction} className="flex flex-wrap items-center gap-2"><input type="hidden" name="ticketId" value={ticket.id} /><input type="hidden" name="mode" value={mode} />{mode.includes("send") || mode === "resend" ? <input type="email" name="recipient" defaultValue={defaultRecipient} placeholder="Test recipient" className={`${dashboardInputClass} max-w-xs`} /> : null}<TestSubmitButton idle={mode === "resend" ? "Resend current QR" : mode === "replace" ? "Replace QR" : "Replace and send"} pending="Working…" /></form>)}
                      </div> : <p className="mt-3 text-xs text-[var(--color-ink-soft)]">QR actions unlock after isolated payment completion.</p>}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
