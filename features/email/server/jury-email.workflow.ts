import { sendEmail } from "@/features/email/server/send-email";
import { juryApplicationReceived } from "@/features/email/templates/jury-application-received";
import { juryApprovedPaymentLink } from "@/features/email/templates/jury-approved-payment-link";
import { juryPaymentConfirmed } from "@/features/email/templates/jury-payment-confirmed";
import { juryRejected } from "@/features/email/templates/jury-rejected";

export async function sendJuryApplicationReceivedEmail({
  to,
  fullName,
}: {
  to: string;
  fullName: string;
}) {
  const template = juryApplicationReceived({ fullName });
  return sendEmail(templateToPayload(to, template));
}

export async function sendJuryApprovedPaymentLinkEmail({
  to,
  fullName,
  checkoutUrl,
}: {
  to: string;
  fullName: string;
  checkoutUrl: string;
}) {
  const template = juryApprovedPaymentLink({ fullName, checkoutUrl });
  return sendEmail(templateToPayload(to, template));
}

export async function sendJuryRejectedEmail({
  to,
  fullName,
}: {
  to: string;
  fullName: string;
}) {
  const template = juryRejected({ fullName });
  return sendEmail(templateToPayload(to, template));
}

export async function sendJuryPaymentConfirmedEmail({
  to,
  fullName,
}: {
  to: string;
  fullName: string;
}) {
  const template = juryPaymentConfirmed({ fullName });
  return sendEmail(templateToPayload(to, template));
}

function templateToPayload(
  to: string,
  template: { subject: string; html: string; text: string }
) {
  return {
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  };
}
