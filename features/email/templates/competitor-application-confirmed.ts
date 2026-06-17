import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

function formatAmount(amountCents: number, currency: string): string {
  const dollars = amountCents / 100;
  const formatted = dollars % 1 === 0 ? String(dollars) : dollars.toFixed(2);
  return `$${formatted} ${currency.toUpperCase()}`;
}

export function competitorApplicationConfirmed({
  fullName,
  categoryName,
  awardName,
  amount,
  currency,
}: {
  fullName: string;
  categoryName: string;
  awardName: string;
  amount: number;
  currency: string;
}) {
  const paragraphs = [
    `Dear ${fullName},`,
    `Your ${formatAmount(amount, currency)} payment for the IBPA Beauty Award competitor application has been received successfully.`,
    `Your application for ${categoryName} / ${awardName} is now complete and has been submitted for review.`,
    "Our judges and admin team will review your materials and follow up with any next steps separately.",
  ];

  return {
    subject: "Your IBPA Competitor Application Is Complete",
    html: wrapEmail("Your competitor application has been confirmed", paragraphs),
    text: buildTextBody(paragraphs),
  };
}
