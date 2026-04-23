import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";

export default async function JuryRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  const content = sessionId
    ? {
        eyebrow: "Payment Received",
        title: "Your payment is being confirmed",
        description:
          "Stripe has returned you to the site successfully. Your jury status will be finalized only after the Stripe webhook confirms payment.",
      }
    : {
        eyebrow: "Awaiting Confirmation",
        title: "Your jury payment is being reviewed",
        description:
          "If you recently completed checkout, please allow a moment for the Stripe webhook to confirm payment. We will send your final confirmation email after that step succeeds.",
      };

  return (
    <PageShell>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      <PageSection className="pb-20">
        <PageCard className="mx-auto max-w-3xl rounded-[1.75rem] p-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
            Jury Payment Status
          </p>
          <p className="mt-5 text-base leading-8 text-[#e7ddc9]">
            Stripe redirects here after checkout, but this page does not activate jury access on its own. If you expected a confirmation and do not receive one, please contact the IBPA admin team for support.
          </p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
