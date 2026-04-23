import { sendEmail } from "@/features/email/server/send-email";
import { competitorApplicationConfirmed } from "@/features/email/templates/competitor-application-confirmed";

export async function sendCompetitorApplicationConfirmedEmail({
  to,
  fullName,
  categoryName,
  awardName,
}: {
  to: string;
  fullName: string;
  categoryName: string;
  awardName: string;
}) {
  const template = competitorApplicationConfirmed({
    fullName,
    categoryName,
    awardName,
  });

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
