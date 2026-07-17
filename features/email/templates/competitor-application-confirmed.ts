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
    `We have received your ${formatAmount(amount, currency)} payment for the IBPA Beauty Award.`,
    `Your application for ${categoryName} / ${awardName} is complete and has been submitted for review.`,
    "Our judging panel and the IBPA team will review your materials. We will contact you if any additional information is needed.",
  ];

  return {
    subject: "Your IBPA Beauty Award Application Is Complete",
    html: wrapEmail("Your application is complete", paragraphs),
    text: buildTextBody(paragraphs),
  };
}
