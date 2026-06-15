import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "Ticket Confirmed — IBPA BEAUTY AWARD 2026",
};

export default function TicketsSuccessPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-white px-8 py-10 shadow-[var(--shadow-md)] text-center">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blue-wash)]">
          <CheckCircle className="h-7 w-7 text-[var(--color-blue)]" strokeWidth={1.5} />
        </div>
        <h1 className="mb-3 text-[1.9rem] leading-tight [font-family:var(--font-accent-family)] text-[var(--color-ink)]">
          Payment Confirmed
        </h1>
        <p className="mb-2 text-[0.95rem] text-[var(--color-ink-soft)] leading-relaxed">
          Your ticket for the <strong>IBPA BEAUTY AWARD 2026</strong> is confirmed.
        </p>
        <p className="mb-8 text-[0.88rem] text-[var(--color-ink-soft)] leading-relaxed">
          We&rsquo;ve emailed your QR code ticket to the address you provided.
          Please show it at the forum check-in desk.
        </p>
        <Link href="/" className="ibpa-button ibpa-button-primary">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
