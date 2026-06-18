import { sendEmail } from "@/features/email/server/send-email";
import { competitorApplicationConfirmed } from "@/features/email/templates/competitor-application-confirmed";

export async function sendCompetitorApplicationConfirmedEmail({
  to,
  fullName,
  categoryName,
  awardName,
  amount,
  currency,
}: {
  to: string;
  fullName: string;
  categoryName: string;
  awardName: string;
  amount: number;
  currency: string;
}) {
  const template = competitorApplicationConfirmed({
    fullName,
    categoryName,
    awardName,
    amount,
    currency,
  });

  return sendEmail({
    type: "user",
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
