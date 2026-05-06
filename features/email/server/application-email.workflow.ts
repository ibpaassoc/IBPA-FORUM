import { EMAIL_APPLICATIONS } from "@/lib/email/config";
import { sendEmail } from "@/features/email/server/send-email";
import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export async function sendApplicationReceivedNotificationEmail({
  applicationType,
  applicantName,
  applicantEmail,
  details = [],
}: {
  applicationType: string;
  applicantName: string;
  applicantEmail: string;
  details?: string[];
}) {
  const paragraphs = [
    `${applicationType} application received.`,
    `Applicant: ${applicantName}`,
    `Email: ${applicantEmail}`,
    ...details,
  ];

  return sendEmail({
    type: "application",
    to: EMAIL_APPLICATIONS,
    subject: `IBPA Application Received: ${applicationType}`,
    html: wrapEmail(`${applicationType} application received`, paragraphs),
    text: buildTextBody(paragraphs),
  });
}
