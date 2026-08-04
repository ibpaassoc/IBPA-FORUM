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
} from "@/features/test/components/TestDashboardUI";

export default async function TestTicketsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const [query, tickets] = await Promise.all([searchParams, getTestTickets()]);
  const defaultRecipient = process.env.TEST_EMAIL_RECIPIENT ?? "";
  return (
    <div className="space-y-8">
      <DashboardHeader label="Payments and QR" title="Tickets" />
      {query.created ? <div role="status" className="rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300">Test ticket created successfully.</div> : null}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-3"><WalletCards aria-hidden className="text-zinc-400" size={18} /><h2 className="font-sans text-xl font-semibold tracking-[-0.025em] text-white">Create ticket</h2></div>
        <form action={createTestTicketAction} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">Ticket type<select name="type" className={`${dashboardSelectClass} mt-2`}><option value="ONE_DAY">One day</option><option value="TWO_DAYS">Two days</option></select></label>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">Discount<select name="discountPercent" className={`${dashboardSelectClass} mt-2`}><option value="0">No discount</option><option value="30">30% test discount</option><option value="40">40% test discount</option></select></label>
          <div className="flex flex-wrap items-center gap-5 rounded-[16px] border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-zinc-300"><label><input type="checkbox" name="galaDinner" className="mr-2" />Gala dinner</label><label><input type="checkbox" name="isIbpaMember" className="mr-2" />IBPA member</label><label><input type="checkbox" name="paid" className="mr-2" />Paid</label></div>
          <div className="sm:col-span-2 lg:col-span-3"><TestSubmitButton idle="Create test ticket" pending="Creating…" /></div>
        </form>
      </GlassCard>
      <DashboardSection title="Test tickets" eyebrow={`${tickets.length} isolated ticket${tickets.length === 1 ? "" : "s"}`}>
        {tickets.length === 0 ? <EmptyState icon={<Ticket size={20} />} title="No test tickets" /> : (
          <div className="grid gap-4">
            {tickets.map((ticket) => {
              const payment = ticket.payments[0];
              const activeQr = ticket.qrCredentials.find((credential) => credential.status === "ACTIVE");
              return (
                <GlassCard key={ticket.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-sans text-xl font-semibold tracking-[-0.025em] text-white">{ticket.fullName}</h2><StatusBadge tone="blue">TEST</StatusBadge><StatusBadge tone={ticket.status === "PAID" ? "green" : "amber"}>{ticket.status}</StatusBadge></div><p className="mt-1 text-sm text-zinc-500">{ticket.email} · {ticket.type} {ticket.galaDinner ? "· gala" : ""}</p><p className="mt-2 text-xs text-zinc-500">Payment: {payment ? `${payment.status} · $${(payment.amount / 100).toFixed(2)}` : "none"} · discount {ticket.promoDiscountPercent ?? 0}%</p></div>
                    {ticket.status === "PENDING" ? <form action={completeTestTicketPaymentAction}><input type="hidden" name="ticketId" value={ticket.id} /><TestSubmitButton idle="Simulate payment" pending="Completing…" /></form> : null}
                  </div>
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    <form action={updateTestTicketAction} className="grid gap-3 rounded-[18px] border border-white/[0.08] bg-black/20 p-4 sm:grid-cols-2">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input name="fullName" defaultValue={ticket.fullName} className={dashboardInputClass} aria-label="Full name" />
                      <input name="email" type="email" defaultValue={ticket.email} className={dashboardInputClass} aria-label="Email" />
                      <input name="phone" defaultValue={ticket.phone} className={dashboardInputClass} aria-label="Phone" />
                      <input name="instagram" defaultValue={ticket.instagram ?? ""} className={dashboardInputClass} aria-label="Instagram" />
                      <select name="type" defaultValue={ticket.type} className={dashboardSelectClass}><option value="ONE_DAY">One day</option><option value="TWO_DAYS">Two days</option></select>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="galaDinner" defaultChecked={ticket.galaDinner} /> Gala dinner</label>
                      <div className="sm:col-span-2"><TestSubmitButton idle="Update with real service" pending="Updating…" /></div>
                    </form>
                    <div className="rounded-[18px] border border-white/[0.08] bg-black/20 p-4">
                      <div className="flex items-center gap-2"><QrCode aria-hidden size={18} className="text-zinc-400" /><p className="text-sm font-semibold">QR credentials</p></div>
                      <p className="mt-2 text-xs text-zinc-500">{ticket.qrCredentials.length} generated · active {activeQr ? activeQr.id : "none"}</p>
                      {ticket.status === "PAID" ? <div className="mt-4 grid gap-2">
                        {["resend", "replace", "replace-send"].map((mode) => <form key={mode} action={testTicketQrAction} className="flex flex-wrap items-center gap-2"><input type="hidden" name="ticketId" value={ticket.id} /><input type="hidden" name="mode" value={mode} />{mode.includes("send") || mode === "resend" ? <input type="email" name="recipient" defaultValue={defaultRecipient} placeholder="Test recipient" className={`${dashboardInputClass} max-w-xs`} /> : null}<TestSubmitButton idle={mode === "resend" ? "Resend current QR" : mode === "replace" ? "Replace QR" : "Replace and send"} pending="Working…" /></form>)}
                      </div> : <p className="mt-3 text-xs text-zinc-500">Available after payment.</p>}
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
