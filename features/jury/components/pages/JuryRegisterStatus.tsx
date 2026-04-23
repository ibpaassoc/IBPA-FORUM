import { PageCard, PageHero, PageSection, PageShell } from "@/shared/components/layout/PageShell";

export default function JuryRegisterStatus({ sessionId }: { sessionId?: string }) {
  return (
    <PageShell>
      <PageHero
        eyebrow="Registration"
        title="Your jury payment is being confirmed"
        description="Stripe has returned you to the registration page. Your jury activation completes only after the webhook confirms payment."
      />

      <PageSection className="pb-20">
        <PageCard className="mx-auto max-w-3xl rounded-[1.75rem] p-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
            Jury Registration Status
          </p>
          <p className="mt-5 text-base leading-8 text-[#e7ddc9]">
            {sessionId
              ? "Your Stripe Checkout session completed successfully. We are waiting for the webhook to confirm the registration."
              : "If you recently completed payment, please allow a moment for Stripe to finalize your registration."}
          </p>
          <p className="mt-4 text-sm leading-7 text-[#d9d4ca]/80">
            Once confirmed, we will send a confirmation email and your jury profile can be activated.
          </p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
