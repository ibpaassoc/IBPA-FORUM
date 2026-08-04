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
  const template = applicationReceivedNotificationTemplate({
    applicationType,
    applicantName,
    applicantEmail,
    details,
  });

  const result = await sendEmail({
    type: "application",
    to: EMAIL_APPLICATIONS,
    ...template,
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

export function applicationReceivedNotificationTemplate({
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
    `A new ${applicationType.toLowerCase()} application has been received.`,
    `Applicant: ${applicantName}`,
    `Email: ${applicantEmail}`,
    ...details,
  ];

  return {
    subject: `New IBPA ${applicationType} Application`,
    html: wrapEmail(`New ${applicationType.toLowerCase()} application`, paragraphs),
    text: buildTextBody(paragraphs),
  };
}
