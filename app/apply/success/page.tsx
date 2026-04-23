import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";

export default async function ApplySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  return (
    <PageShell>
      <PageHero
        eyebrow="Payment Return"
        title="Your payment is being confirmed"
        description="Stripe has returned you to the IBPA application site. Your competitor application becomes complete only after our webhook confirms the payment successfully."
      />

      <PageSection className="pb-20">
        <PageCard className="mx-auto max-w-3xl rounded-[1.75rem] p-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
            Competitor Application Status
          </p>
          <p className="mt-5 text-base leading-8 text-[#e7ddc9]">
            {sessionId
              ? "Your Stripe Checkout session completed successfully. We are now waiting for Stripe to deliver the webhook that marks your application as paid and submitted."
              : "If you recently completed payment, please allow a moment for the Stripe webhook to finalize your application."}
          </p>
          <p className="mt-4 text-sm leading-7 text-[#d9d4ca]/80">
            Once confirmed, we will email you to confirm that payment was received,
            your application is complete, and it will be reviewed by the judges and
            admin team.
          </p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
