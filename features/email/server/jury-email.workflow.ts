import { EMAIL_APPLICATIONS } from "@/lib/email/config";
import { sendEmail } from "@/features/email/server/send-email";
import { juryApplicationReceived } from "@/features/email/templates/jury-application-received";
import { juryAdditionalInfoRequested } from "@/features/email/templates/jury-additional-info-requested";
import { juryApprovedPaymentLink } from "@/features/email/templates/jury-approved-payment-link";
import { juryPaymentConfirmed } from "@/features/email/templates/jury-payment-confirmed";
import { juryRejected } from "@/features/email/templates/jury-rejected";
import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

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
  amount,
  currency,
}: {
  to: string;
  fullName: string;
  amount: number;
  currency: string;
}) {
  const template = juryPaymentConfirmed({ fullName, amount, currency });
  return sendEmail(templateToPayload(to, template));
}

export async function sendJuryAdditionalInfoRequestedEmail({
  to,
  fullName,
  details,
  actionUrl,
}: {
  to: string;
  fullName: string;
  details: string;
  actionUrl: string;
}) {
  const template = juryAdditionalInfoRequested({ fullName, details, actionUrl });
  return sendEmail(templateToPayload(to, template));
}

export async function sendJuryResubmittedAdminNotificationEmail({
  fullName,
  applicantEmail,
  adminReviewUrl,
}: {
  fullName: string;
  applicantEmail: string;
  adminReviewUrl: string;
}) {
  const paragraphs = [
    "A jury applicant has submitted the requested updates.",
    `Applicant: ${fullName}`,
    `Email: ${applicantEmail}`,
    `Review the updated application: ${adminReviewUrl}`,
  ];

  return sendEmail({
    type: "application",
    to: EMAIL_APPLICATIONS,
    subject: `IBPA Jury Application Updated — ${fullName}`,
    html: wrapEmail("Jury application updated", paragraphs),
    text: buildTextBody(paragraphs),
  });
}

function templateToPayload(
  to: string,
  template: { subject: string; html: string; text: string }
) {
  return {
    type: "user" as const,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  };
}
