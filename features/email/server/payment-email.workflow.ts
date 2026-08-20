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

export async function sendTicketPaymentAdminNotificationEmail({
  attendeeNames,
  attendeeEmails,
  ticketSummary,
  totalAmount,
  paidAmount,
  nextAmount,
  currency,
  paymentStatus,
  nextPaymentAt,
  stripeSessionId,
  stripePaymentIntentId,
}: {
  attendeeNames: string;
  attendeeEmails: string;
  ticketSummary: string;
  totalAmount: number;
  paidAmount: number;
  nextAmount: number | null;
  currency: string;
  paymentStatus: "PAID" | "PARTIALLY_PAID";
  nextPaymentAt: Date | null;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
}) {
  const template = ticketPaymentAdminNotificationTemplate({
    attendeeNames,
    attendeeEmails,
    ticketSummary,
    totalAmount,
    paidAmount,
    nextAmount,
    currency,
    paymentStatus,
    nextPaymentAt,
    stripeSessionId,
    stripePaymentIntentId,
  });
  const result = await sendEmail({ type: "payment", to: EMAIL_PAYMENTS, ...template });

  if (!result.delivered) {
    console.error("Ticket payment admin notification email was not delivered", {
      stripeSessionId,
      reason: result.reason,
      error: result.error,
      recipient: result.recipient,
    });
  } else {
    console.info("Ticket payment admin notification email sent", {
      stripeSessionId,
      recipient: result.recipient,
      providerId: result.providerId,
    });
  }

  return result;
}

export function ticketPaymentAdminNotificationTemplate({
  attendeeNames,
  attendeeEmails,
  ticketSummary,
  totalAmount,
  paidAmount,
  nextAmount,
  currency,
  paymentStatus,
  nextPaymentAt,
  stripeSessionId,
  stripePaymentIntentId,
}: {
  attendeeNames: string;
  attendeeEmails: string;
  ticketSummary: string;
  totalAmount: number;
  paidAmount: number;
  nextAmount: number | null;
  currency: string;
  paymentStatus: "PAID" | "PARTIALLY_PAID";
  nextPaymentAt: Date | null;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
}) {
  const normalizedCurrency = currency.toUpperCase();
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
    }).format(value / 100);
  const partial = paymentStatus === "PARTIALLY_PAID";
  const nextPayment = nextPaymentAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeZone: "UTC",
      }).format(nextPaymentAt)
    : null;
  const statusLabel = partial ? "Partially paid" : "Fully paid";
  const paragraphs = [
    `A new IBPA forum ticket purchase is ${statusLabel.toLowerCase()}.`,
    `Attendee${attendeeNames.includes(",") ? "s" : ""}: ${attendeeNames}`,
    `Email${attendeeEmails.includes(",") ? "s" : ""}: ${attendeeEmails}`,
    `Ticket: ${ticketSummary}`,
    `Payment status: ${statusLabel}`,
    `Paid now: ${formatMoney(paidAmount)}`,
    `Order total: ${formatMoney(totalAmount)}`,
    ...(partial && nextPayment && nextAmount !== null
      ? [`Next payment: ${formatMoney(nextAmount)} on ${nextPayment}`]
      : []),
    `Stripe checkout session: ${stripeSessionId}`,
    `Stripe payment intent: ${stripePaymentIntentId ?? "Not provided"}`,
  ];

  return {
    subject: `IBPA Forum Ticket Purchase — ${statusLabel}`,
    html: wrapEmail(`New ticket purchase · ${statusLabel}`, paragraphs),
    text: buildTextBody(paragraphs),
  };
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
