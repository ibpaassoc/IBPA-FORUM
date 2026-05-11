import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import RetryCheckoutButton from "@/features/applications/components/application-form/RetryCheckoutButton";
import { IconBadge, PageHero, PageSection } from "@/shared/components/public";

export default function PaymentCancelCard({
  applicationId,
}: {
  applicationId?: string;
}) {
  return (
    <main className="page-shell">
      <PageHero
        eyebrow="Payment Canceled"
        title="Your application is saved, but not complete yet"
        description="Stripe Checkout was canceled before payment finished. Your competitor application has not been finalized and will not be reviewed until payment succeeds."
      />

      <PageSection className="pb-20">
        <div className="page-card mx-auto flex max-w-3xl flex-col items-center rounded-(--radius-lg) p-8 text-center">
          <IconBadge icon={RefreshCcw} size={28} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover)]">
            Next Step
          </p>
          <p className="mt-5 text-base leading-8 text-[var(--color-ink-soft)]">
            You can return to secure Stripe Checkout using the saved application,
            or go back to the application page if you need to start over.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            {applicationId ? <RetryCheckoutButton applicationId={applicationId} /> : null}

            <Link
              href="/apply"
              className="ibpa-button ibpa-button-ghost"
            >
              Back to Application Form
            </Link>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
