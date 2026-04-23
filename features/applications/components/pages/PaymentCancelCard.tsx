import Link from "next/link";
import RetryCheckoutButton from "@/features/applications/components/application-form/RetryCheckoutButton";
import { PageCard, PageHero, PageSection, PageShell } from "@/shared/components/layout/PageShell";

export default function PaymentCancelCard({
  applicationId,
}: {
  applicationId?: string;
}) {
  return (
    <PageShell>
      <PageHero
        eyebrow="Payment Canceled"
        title="Your application is saved, but not complete yet"
        description="Stripe Checkout was canceled before payment finished. Your competitor application has not been finalized and will not be reviewed until payment succeeds."
      />

      <PageSection className="pb-20">
        <PageCard className="mx-auto max-w-3xl rounded-[1.75rem] p-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
            Next Step
          </p>
          <p className="mt-5 text-base leading-8 text-[#e7ddc9]">
            You can return to secure Stripe Checkout using the saved application,
            or go back to the application page if you need to start over.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            {applicationId ? <RetryCheckoutButton applicationId={applicationId} /> : null}

            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Back to Application Form
            </Link>
          </div>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}
