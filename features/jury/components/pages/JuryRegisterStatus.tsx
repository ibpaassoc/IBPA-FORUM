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
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-(--color-hover)">
            Jury Registration Status
          </p>
          <p className="mt-5 text-base leading-8 text-(--color-steel)">
            {sessionId
              ? "Your Stripe Checkout session completed successfully. We are waiting for the webhook to confirm the registration."
              : "If you recently completed payment, please allow a moment for Stripe to finalize your registration."}
          </p>
          <p className="mt-4 text-sm leading-7 text-(--text-muted)">
            Once confirmed, we will send a confirmation email and your jury profile can be activated.
          </p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
