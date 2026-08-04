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
  const template = paymentAdminNotificationTemplate({
    flowLabel,
    applicantName,
    applicantEmail,
    amount,
    currency,
    stripeSessionId,
    stripePaymentIntentId,
  });
  const result = await sendEmail({ type: "payment", to: EMAIL_PAYMENTS, ...template });

  if (!result.delivered) {
    console.error("Payment admin notification email was not delivered", {
      flowLabel,
      stripeSessionId,
      reason: result.reason,
      error: result.error,
      recipient: result.recipient,
    });
  } else {
    console.info("Payment admin notification email sent", {
      flowLabel,
      stripeSessionId,
      recipient: result.recipient,
      providerId: result.providerId,
    });
  }

  return result;
}

export function paymentAdminNotificationTemplate({
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
    `A ${flowLabel.toLowerCase()} payment has been confirmed.`,
    `Applicant: ${applicantName}`,
    `Email: ${applicantEmail}`,
    `Amount: ${formattedAmount}`,
    `Stripe checkout session: ${stripeSessionId}`,
    `Stripe payment intent: ${stripePaymentIntentId ?? "Not provided"}`,
  ];

  return {
    subject: `IBPA ${flowLabel} Payment Confirmed`,
    html: wrapEmail(`${flowLabel} payment confirmed`, paragraphs),
    text: buildTextBody(paragraphs),
  };
}
