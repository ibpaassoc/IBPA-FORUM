import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export function competitorApplicationConfirmed({
  fullName,
  categoryName,
  awardName,
}: {
  fullName: string;
  categoryName: string;
  awardName: string;
}) {
  const paragraphs = [
    `Dear ${fullName},`,
    "Your $50 USD payment for the IBPA Beauty Championship competitor application has been received successfully.",
    `Your application for ${categoryName} / ${awardName} is now complete and has been submitted for review.`,
    "Our judges and admin team will review your materials and follow up with any next steps separately.",
  ];

  return {
    subject: "Your IBPA Competitor Application Is Complete",
    html: wrapEmail("Your competitor application has been confirmed", paragraphs),
    text: buildTextBody(paragraphs),
  };
}
