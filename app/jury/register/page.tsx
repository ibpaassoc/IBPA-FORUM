import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";
import { validateJuryRegistrationToken } from "@/lib/jury/service";

export default async function JuryRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; session_id?: string }>;
}) {
  const { token, session_id: sessionId } = await searchParams;
  const validation = token
    ? await validateJuryRegistrationToken(token)
    : { status: "missing" as const };

  const content =
    validation.status === "valid"
      ? {
          eyebrow: "Registration Ready",
          title: "Your jury onboarding link is active",
          description: `Welcome, ${validation.fullName}. Your payment has been confirmed and your jury registration link is valid. The full jury portal is the next step, and this placeholder confirms your access token has been prepared correctly.`,
        }
      : sessionId
        ? {
            eyebrow: "Payment Received",
            title: "Your payment is being confirmed",
            description:
              "Stripe has returned you to the site successfully. We will finalize your jury activation through the webhook flow and send your secure registration link by email.",
          }
        : validation.status === "expired"
          ? {
              eyebrow: "Link Expired",
              title: "This registration link has expired",
              description:
                "Your payment was recorded, but the temporary registration link is no longer valid. Please contact the IBPA team so a fresh onboarding link can be issued.",
            }
          : {
              eyebrow: "Invalid Link",
              title: "This registration link is not valid",
              description:
                "We could not verify this onboarding link. Please use the latest registration email sent after payment confirmation.",
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
            Jury Onboarding
          </p>
          <p className="mt-5 text-base leading-8 text-[#e7ddc9]">
            {validation.status === "valid"
              ? "The next implementation step will connect this verified link to the future jury portal and onboarding profile setup."
              : "If you expected access here, check the payment confirmation email or contact the IBPA admin team for support."}
          </p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
