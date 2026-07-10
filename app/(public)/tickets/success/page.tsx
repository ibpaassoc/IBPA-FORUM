import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { getServerTranslations } from "@/lib/i18n/server";
import { RefundNotice } from "@/features/tickets/components/RefundNotice";

export const metadata = {
  title: "Ticket Confirmed — IBPA BEAUTY AWARD 2026",
};

export default async function TicketsSuccessPage() {
  const t = (await getServerTranslations()).ticketFlow.success;

  return (
    <main className="page-shell flex min-h-screen items-center justify-center p-6">
      <div className="premium-glass w-full max-w-md px-8 py-10 text-center">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blue-wash)]">
          <CheckCircle className="h-7 w-7 text-[var(--color-blue)]" strokeWidth={1.5} />
        </div>
        <h1 className="mb-3 text-[1.9rem] leading-tight [font-family:var(--font-accent-family)] text-[var(--color-ink)]">
          {t.title}
        </h1>
        <p className="mb-2 text-[0.95rem] text-[var(--color-ink-soft)] leading-relaxed">
          {t.subtitle}
        </p>
        <p className="mb-8 text-[0.88rem] text-[var(--color-ink-soft)] leading-relaxed">
          {t.emailed}
        </p>
        <Link href="/" className="ibpa-button ibpa-button-blue">
          {t.backHome}
        </Link>

        {/* Refund policy — shown only here, after a real ticket payment succeeds. */}
        <RefundNotice text={t.refundNotice} />
      </div>
    </main>
  );
}
