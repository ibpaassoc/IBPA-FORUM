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

  const result = await sendEmail({
    type: "application",
    to: EMAIL_APPLICATIONS,
    subject: `IBPA Application Received: ${applicationType}`,
    html: wrapEmail(`${applicationType} application received`, paragraphs),
    text: buildTextBody(paragraphs),
  });

  if (!result.delivered) {
    console.error("Application received notification email was not delivered", {
      applicationType,
      reason: result.reason,
      error: result.error,
      recipient: result.recipient,
    });
  }

  return result;
}
