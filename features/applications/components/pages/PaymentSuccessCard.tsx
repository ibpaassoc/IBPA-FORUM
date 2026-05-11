import { CheckCircle2 } from "lucide-react";
import { IconBadge, PageHero, PageSection } from "@/shared/components/public";

export default function PaymentSuccessCard({ sessionId }: { sessionId?: string }) {
  return (
    <main className="page-shell">
      <PageHero
        eyebrow="Payment Return"
        title="Your payment is being confirmed"
        description="Stripe has returned you to the IBPA application site. Your competitor application becomes complete only after our webhook confirms the payment successfully."
      />

      <PageSection className="pb-20">
        <div className="page-card mx-auto flex max-w-3xl flex-col items-center rounded-(--radius-lg) p-8 text-center">
          <IconBadge icon={CheckCircle2} size={28} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover)]">
            Competitor Application Status
          </p>
          <p className="mt-5 text-base leading-8 text-[var(--color-ink-soft)]">
            {sessionId
              ? "Your Stripe Checkout session completed successfully. We are now waiting for Stripe to deliver the webhook that marks your application as paid and submitted."
              : "If you recently completed payment, please allow a moment for the Stripe webhook to finalize your application."}
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Once confirmed, we will email you to confirm that payment was received,
            your application is complete, and it will be reviewed by the judges and
            admin team.
          </p>
        </div>
      </PageSection>
    </main>
  );
}
