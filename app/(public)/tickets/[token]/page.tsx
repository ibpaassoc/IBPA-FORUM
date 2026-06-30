import { notFound } from "next/navigation";
import Link from "next/link";
import { findTicketWithPaymentByToken } from "@/features/tickets/server/ticket-repository";

export const metadata = {
  title: "Payment Details — IBPA BEAUTY AWARD 2026",
};

const TICKET_LABELS: Record<string, string> = {
  ONE_DAY: "1-Day Forum Pass",
  TWO_DAYS: "2-Day Forum Pass",
};

export default async function TicketPaymentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ticket = await findTicketWithPaymentByToken(token);

  if (!ticket || ticket.status === "CANCELED") {
    notFound();
  }

  const payment = ticket.payments[0] ?? null;
  const amountFormatted = payment
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: payment.currency.toUpperCase(),
      }).format(payment.amount / 100)
    : null;

  const paidDateFormatted = payment?.paidAt
    ? new Date(payment.paidAt).toLocaleDateString("en-US", { dateStyle: "long" })
    : null;

  const paymentRef = payment?.stripePaymentIntentId
    ? `···${payment.stripePaymentIntentId.slice(-8)}`
    : null;

  return (
    <main className="page-shell flex min-h-screen items-center justify-center p-6">
      <div className="premium-glass w-full max-w-md px-8 py-10">
        <p className="mb-5 text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--color-blue)]">
          IBPA BEAUTY AWARD 2026
        </p>

        <h1 className="mb-1 text-[1.7rem] leading-tight [font-family:var(--font-accent-family)] text-[var(--color-ink)]">
          Payment Details
        </h1>
        <p className="mb-8 text-[0.9rem] text-[var(--color-ink-soft)]">
          {ticket.fullName}
        </p>

        {/* Ticket info */}
        <div className="mb-4 rounded-xl border border-[var(--border-soft)] bg-white/72 px-5 py-4">
          <p className="mb-3 text-[10px] font-bold tracking-[0.14em] uppercase text-[var(--color-ink-muted)]">
            Ticket
          </p>
          <Row label="Type" value={TICKET_LABELS[ticket.type] ?? ticket.type} />
          <Row
            label="Gala Dinner"
            value={ticket.galaDinner ? "Included" : "Not included"}
          />
          {ticket.instagram && <Row label="Instagram" value={`@${ticket.instagram}`} />}
          <Row
            label="Status"
            value={ticket.status === "PAID" ? "Paid" : ticket.status}
            highlight={ticket.status === "PAID"}
          />
        </div>

        {/* Payment info */}
        {payment && (
          <div className="rounded-xl border border-[var(--border-soft)] bg-white/72 px-5 py-4">
            <p className="mb-3 text-[10px] font-bold tracking-[0.14em] uppercase text-[var(--color-ink-muted)]">
              Payment
            </p>
            {amountFormatted && <Row label="Amount" value={amountFormatted} />}
            {paidDateFormatted && <Row label="Date paid" value={paidDateFormatted} />}
            {paymentRef && <Row label="Reference" value={paymentRef} />}
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="ibpa-button ibpa-button-ghost w-full text-center">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-[var(--color-ink-soft)]">{label}</span>
      <span
        className={
          highlight
            ? "font-semibold text-[var(--color-blue)]"
            : "font-medium text-[var(--color-ink)]"
        }
      >
        {value}
      </span>
    </div>
  );
}
