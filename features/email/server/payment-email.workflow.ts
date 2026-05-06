import { EMAIL_PAYMENTS } from "@/lib/email/config";
import { sendEmail } from "@/features/email/server/send-email";
import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export async function sendPaymentAdminNotificationEmail({
  flowLabel,
  applicantName,
  applicantEmail,
  amount,
  currency,
  stripeSessionId,
  stripePaymentIntentId,
}: {
  flowLabel: string;
  applicantName: string;
  applicantEmail: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
}) {
  const normalizedCurrency = currency.toUpperCase();
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency,
  }).format(amount / 100);
  const paragraphs = [
    `${flowLabel} payment confirmed.`,
    `Applicant: ${applicantName}`,
    `Email: ${applicantEmail}`,
    `Amount: ${formattedAmount}`,
    `Stripe checkout session: ${stripeSessionId}`,
    `Stripe payment intent: ${stripePaymentIntentId ?? "Not provided"}`,
  ];

  return sendEmail({
    type: "payment",
    to: EMAIL_PAYMENTS,
    subject: `IBPA Payment Confirmed: ${flowLabel}`,
    html: wrapEmail(`${flowLabel} payment confirmed`, paragraphs),
    text: buildTextBody(paragraphs),
  });
}
